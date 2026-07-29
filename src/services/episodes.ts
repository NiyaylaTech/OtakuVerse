import { EpisodeDiscussion } from '../models/EpisodeDiscussion';

export interface AnimeEpisode {
  episodeNumber: number;
  seasonNumber: number;
  episodeInSeason: number;
  title: string | null;
  description: string | null;
  titleJapanese: string | null;
  titleRomanji: string | null;
  airedAt: string | null;
  runtime: string | number | null;
  isFiller: boolean;
  isRecap: boolean;
  source: 'jikan' | 'fallback';
  commentCount?: number;
  participantCount?: number;
  lastActivityAt?: Date | string | null;
}

export interface SeasonInfo {
  seasonNumber: number;
  title: string;
  anilistId: number;
  idMal: number | null;
  episodesCount: number | null;
  format: string | null;
  isCurrent: boolean;
}

// Cache for Jikan episodes (24 hour TTL)
const jikanEpisodeCache = new Map<number, { timestamp: number; episodes: AnimeEpisode[] }>();
const JIKAN_CACHE_TTL = 24 * 60 * 60 * 1000;

// Ongoing deduplicated promises for Jikan requests
const pendingJikanRequests = new Map<number, Promise<AnimeEpisode[]>>();

/**
 * Fetch AniList Media Info and Relations for Season Mapping
 */
export async function fetchAniListMediaWithRelations(anilistId: number): Promise<{
  idMal: number | null;
  episodesCount: number | null;
  title: string;
  description: string | null;
  format: string | null;
  seasons: SeasonInfo[];
}> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        episodes
        format
        season
        seasonYear
        description
        title {
          english
          romaji
          userPreferred
        }
        relations {
          edges {
            relationType
            node {
              id
              idMal
              format
              episodes
              seasonYear
              title {
                english
                romaji
                userPreferred
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables: { id: anilistId } }),
    });

    if (!res.ok) {
      console.warn(`[AniList Fetch] Status ${res.status} for ID ${anilistId}`);
      return {
        idMal: null,
        episodesCount: null,
        title: 'Anime Series',
        description: null,
        format: null,
        seasons: [{ seasonNumber: 1, title: 'Season 1', anilistId, idMal: null, episodesCount: 12, format: 'TV', isCurrent: true }],
      };
    }

    const json = await res.json();
    const media = json?.data?.Media;
    if (!media) {
      return {
        idMal: null,
        episodesCount: null,
        title: 'Anime Series',
        description: null,
        format: null,
        seasons: [{ seasonNumber: 1, title: 'Season 1', anilistId, idMal: null, episodesCount: 12, format: 'TV', isCurrent: true }],
      };
    }

    const mainTitle = media.title?.english || media.title?.userPreferred || media.title?.romaji || 'Anime Series';
    
    // Map seasons
    const seasonsList: SeasonInfo[] = [
      {
        seasonNumber: 1,
        title: 'Season 1',
        anilistId: media.id,
        idMal: media.idMal || null,
        episodesCount: media.episodes || null,
        format: media.format || 'TV',
        isCurrent: true,
      },
    ];

    let nextSeasonNum = 2;
    let hasOva = false;
    let hasSpecial = false;

    if (media.relations?.edges && Array.isArray(media.relations.edges)) {
      for (const edge of media.relations.edges) {
        const node = edge.node;
        if (!node) continue;

        if (edge.relationType === 'SEQUEL') {
          const sTitle = node.title?.english || node.title?.userPreferred || `Season ${nextSeasonNum}`;
          seasonsList.push({
            seasonNumber: nextSeasonNum,
            title: sTitle.includes('Season') || sTitle.includes('2nd') || sTitle.includes('3rd') ? sTitle : `Season ${nextSeasonNum}: ${sTitle}`,
            anilistId: node.id,
            idMal: node.idMal || null,
            episodesCount: node.episodes || null,
            format: node.format || 'TV',
            isCurrent: node.id === anilistId,
          });
          nextSeasonNum++;
        } else if (node.format === 'OVA' && !hasOva) {
          hasOva = true;
          seasonsList.push({
            seasonNumber: 99, // convention for OVA
            title: 'OVAs',
            anilistId: node.id,
            idMal: node.idMal || null,
            episodesCount: node.episodes || null,
            format: 'OVA',
            isCurrent: node.id === anilistId,
          });
        } else if (node.format === 'SPECIAL' && !hasSpecial) {
          hasSpecial = true;
          seasonsList.push({
            seasonNumber: 98, // convention for Specials
            title: 'Specials',
            anilistId: node.id,
            idMal: node.idMal || null,
            episodesCount: node.episodes || null,
            format: 'SPECIAL',
            isCurrent: node.id === anilistId,
          });
        }
      }
    }

    return {
      idMal: media.idMal || null,
      episodesCount: media.episodes || null,
      title: mainTitle,
      description: media.description || null,
      format: media.format || null,
      seasons: seasonsList,
    };
  } catch (err: any) {
    console.error(`[AniList Media Fetch Error]:`, err?.message || err);
    return {
      idMal: null,
      episodesCount: null,
      title: 'Anime Series',
      description: null,
      format: null,
      seasons: [{ seasonNumber: 1, title: 'Season 1', anilistId, idMal: null, episodesCount: 12, format: 'TV', isCurrent: true }],
    };
  }
}

/**
 * Fetch episodes for a MAL ID from Jikan API
 */
async function fetchEpisodesFromJikan(malId: number, seasonNum: number): Promise<AnimeEpisode[]> {
  const cached = jikanEpisodeCache.get(malId);
  if (cached && Date.now() - cached.timestamp < JIKAN_CACHE_TTL) {
    return cached.episodes;
  }

  if (pendingJikanRequests.has(malId)) {
    return pendingJikanRequests.get(malId)!;
  }

  const requestPromise = (async (): Promise<AnimeEpisode[]> => {
    try {
      const allJikanItems: any[] = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage && page <= 10) {
        const url = `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`;
        const response = await fetch(url);

        if (response.status === 429) {
          console.warn(`[Jikan 429] Backing off for MAL ID ${malId}, page ${page}`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (page === 1 && allJikanItems.length === 0) {
            throw new Error('Jikan Rate Limit Exceeded (HTTP 429)');
          } else {
            break;
          }
        }

        if (!response.ok) {
          if (page === 1) {
            throw new Error(`Jikan returned HTTP ${response.status}`);
          }
          break;
        }

        const data = await response.json();
        const items = data?.data || [];
        allJikanItems.push(...items);

        hasNextPage = data?.pagination?.has_next_page || false;
        page++;

        if (hasNextPage) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      if (allJikanItems.length === 0) {
        throw new Error('No episode data returned from Jikan');
      }

      const normalized: AnimeEpisode[] = allJikanItems.map((item: any) => {
        const epNum = item.mal_id || item.episode || 1;
        
        // Clean synopsis/description
        let desc = item.synopsis || item.description || null;
        if (desc) {
          desc = desc.replace(/\\n/g, ' ').trim();
        }

        return {
          episodeNumber: epNum,
          seasonNumber: seasonNum,
          episodeInSeason: epNum,
          title: item.title || item.title_romanji || null,
          description: desc,
          titleJapanese: item.title_japanese || null,
          titleRomanji: item.title_romanji || null,
          airedAt: item.aired ? (typeof item.aired === 'string' ? item.aired : item.aired.from || null) : null,
          runtime: item.duration || '24 min',
          isFiller: Boolean(item.filler),
          isRecap: Boolean(item.recap),
          source: 'jikan',
        };
      });

      jikanEpisodeCache.set(malId, { timestamp: Date.now(), episodes: normalized });
      return normalized;
    } catch (error: any) {
      console.warn(`[Jikan Fetch Error for MAL ID ${malId}]:`, error?.message || error);
      throw error;
    } finally {
      pendingJikanRequests.delete(malId);
    }
  })();

  pendingJikanRequests.set(malId, requestPromise);
  return requestPromise;
}

/**
 * Generate fallback episode list
 */
function generateFallbackEpisodes(count: number, seasonNum: number): AnimeEpisode[] {
  const safeCount = Math.max(1, Math.min(count || 12, 100));
  const episodes: AnimeEpisode[] = [];

  for (let i = 1; i <= safeCount; i++) {
    episodes.push({
      episodeNumber: i,
      seasonNumber: seasonNum,
      episodeInSeason: i,
      title: null,
      description: null,
      titleJapanese: null,
      titleRomanji: null,
      airedAt: null,
      runtime: '24 min',
      isFiller: false,
      isRecap: false,
      source: 'fallback',
    });
  }

  return episodes;
}

/**
 * Fetch and normalize episodes for an anime and season
 */
export async function getEpisodesForAnimeAndSeason(
  anilistId: number,
  targetSeasonNumber: number = 1
): Promise<{
  episodes: AnimeEpisode[];
  idMal: number | null;
  seasonNumber: number;
  seasons: SeasonInfo[];
  verified: boolean;
}> {
  const mediaInfo = await fetchAniListMediaWithRelations(anilistId);
  const seasons = mediaInfo.seasons;

  // Find target season or default to current
  const activeSeason = seasons.find((s) => s.seasonNumber === targetSeasonNumber) || seasons[0];
  const targetAnilistId = activeSeason ? activeSeason.anilistId : anilistId;
  const targetMalId = activeSeason?.idMal || mediaInfo.idMal;
  const expectedCount = activeSeason?.episodesCount || mediaInfo.episodesCount || 12;

  let episodes: AnimeEpisode[] = [];

  if (targetMalId) {
    try {
      episodes = await fetchEpisodesFromJikan(targetMalId, activeSeason.seasonNumber);
    } catch (err) {
      console.log(`[Jikan Fallback] Generating fallback for AniList ID ${targetAnilistId}`);
      episodes = generateFallbackEpisodes(expectedCount, activeSeason.seasonNumber);
    }
  } else {
    episodes = generateFallbackEpisodes(expectedCount, activeSeason.seasonNumber);
  }

  // Attach discussion statistics from DB
  try {
    const discussions = await EpisodeDiscussion.find({
      anilistId,
      seasonNumber: activeSeason.seasonNumber,
    });

    const discussionMap = new Map<
      number,
      { commentCount: number; participantCount: number; lastActivityAt: Date }
    >();

    for (const d of discussions) {
      discussionMap.set(d.episodeNumber, {
        commentCount: d.commentCount || 0,
        participantCount: d.participantCount || 0,
        lastActivityAt: d.lastActivityAt || d.updatedAt,
      });
    }

    episodes = episodes.map((ep) => {
      const stats = discussionMap.get(ep.episodeNumber);
      return {
        ...ep,
        commentCount: stats?.commentCount || 0,
        participantCount: stats?.participantCount || 0,
        lastActivityAt: stats?.lastActivityAt || null,
      };
    });
  } catch (dbErr) {
    console.warn('[Discussion Stats Attach Warning]:', dbErr);
  }

  return {
    episodes,
    idMal: targetMalId,
    seasonNumber: activeSeason.seasonNumber,
    seasons,
    verified: true,
  };
}

/**
 * Backward compatible export
 */
export async function getEpisodesForAnime(anilistId: number) {
  return getEpisodesForAnimeAndSeason(anilistId, 1);
}
