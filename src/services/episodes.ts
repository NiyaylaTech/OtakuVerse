import { AnimeSeasonMapping } from '../models/AnimeSeasonMapping';
import { EpisodeDiscussion } from '../models/EpisodeDiscussion';

export interface AnimeEpisode {
  episodeNumber: number;
  seasonNumber: number;
  episodeInSeason: number;
  title: string | null;
  titleJapanese: string | null;
  titleRomanji: string | null;
  airedAt: string | null;
  isFiller: boolean;
  isRecap: boolean;
  source: 'jikan' | 'fallback';
  commentCount?: number;
  participantCount?: number;
  lastActivityAt?: Date | string | null;
}

// In-memory server cache for Jikan episodes (24 hour TTL)
const jikanEpisodeCache = new Map<number, { timestamp: number; episodes: AnimeEpisode[] }>();
const JIKAN_CACHE_TTL = 24 * 60 * 60 * 1000;

// Ongoing deduplicated promises for Jikan requests
const pendingJikanRequests = new Map<number, Promise<AnimeEpisode[]>>();

/**
 * Fetch AniList idMal & total episode count directly via AniList GraphQL
 */
async function fetchAniListMediaInfo(anilistId: number): Promise<{
  idMal: number | null;
  episodesCount: number | null;
  title: string;
}> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        episodes
        title {
          english
          romaji
          userPreferred
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
      console.warn(`[AniList Info Fetch] Non-OK status ${res.status} for ID ${anilistId}`);
      return { idMal: null, episodesCount: null, title: 'Anime Series' };
    }

    const json = await res.json();
    const media = json?.data?.Media;
    if (!media) {
      return { idMal: null, episodesCount: null, title: 'Anime Series' };
    }

    const title = media.title?.english || media.title?.romaji || media.title?.userPreferred || 'Anime Series';
    return {
      idMal: media.idMal || null,
      episodesCount: media.episodes || null,
      title,
    };
  } catch (err: any) {
    console.error(`[AniList Info Fetch Error]:`, err?.message || err);
    return { idMal: null, episodesCount: null, title: 'Anime Series' };
  }
}

/**
 * Fetch episodes for a MAL ID from Jikan API with pagination, rate limiting & error handling
 */
async function fetchEpisodesFromJikan(malId: number, seasonNum: number): Promise<AnimeEpisode[]> {
  // Check memory cache
  const cached = jikanEpisodeCache.get(malId);
  if (cached && Date.now() - cached.timestamp < JIKAN_CACHE_TTL) {
    return cached.episodes;
  }

  // Check if a request is already pending to avoid rate limit spikes
  if (pendingJikanRequests.has(malId)) {
    return pendingJikanRequests.get(malId)!;
  }

  const requestPromise = (async (): Promise<AnimeEpisode[]> => {
    try {
      const allJikanItems: any[] = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage && page <= 10) { // Limit to 10 pages max (1000 episodes)
        const url = `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`;
        const response = await fetch(url);

        if (response.status === 429) {
          console.warn(`[Jikan 429 Rate Limit] Backing off for MAL ID ${malId}, page ${page}`);
          // Short delay on 429
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (page === 1 && allJikanItems.length === 0) {
            throw new Error('Jikan Rate Limit Exceeded (HTTP 429)');
          } else {
            break; // Keep items fetched so far
          }
        }

        if (!response.ok) {
          console.warn(`[Jikan API Error] HTTP ${response.status} for MAL ID ${malId}`);
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
          // Respect Jikan 3 requests/sec rate limit
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      if (allJikanItems.length === 0) {
        throw new Error('No episode data returned from Jikan');
      }

      const normalized: AnimeEpisode[] = allJikanItems.map((item: any) => {
        const epNum = item.mal_id || item.episode || 1;
        return {
          episodeNumber: epNum,
          seasonNumber: seasonNum,
          episodeInSeason: epNum,
          title: item.title || null,
          titleJapanese: item.title_japanese || null,
          titleRomanji: item.title_romanji || null,
          airedAt: item.aired || null,
          isFiller: Boolean(item.filler),
          isRecap: Boolean(item.recap),
          source: 'jikan',
        };
      });

      // Save to cache
      jikanEpisodeCache.set(malId, { timestamp: Date.now(), episodes: normalized });
      return normalized;
    } catch (error: any) {
      console.warn(`[Jikan Fetch Fallback for MAL ID ${malId}]:`, error?.message || error);
      throw error;
    } finally {
      pendingJikanRequests.delete(malId);
    }
  })();

  pendingJikanRequests.set(malId, requestPromise);
  return requestPromise;
}

/**
 * Generate fallback episode list when Jikan is unavailable or idMal is null
 */
function generateFallbackEpisodes(count: number, seasonNum: number): AnimeEpisode[] {
  const safeCount = Math.max(1, Math.min(count || 12, 100)); // Reasonable bounds
  const episodes: AnimeEpisode[] = [];

  for (let i = 1; i <= safeCount; i++) {
    episodes.push({
      episodeNumber: i,
      seasonNumber: seasonNum,
      episodeInSeason: i,
      title: null, // Title Unavailable
      titleJapanese: null,
      titleRomanji: null,
      airedAt: null,
      isFiller: false,
      isRecap: false,
      source: 'fallback',
    });
  }

  return episodes;
}

/**
 * Fetch and normalize episodes for an AniList anime
 */
export async function getEpisodesForAnime(anilistId: number): Promise<{
  episodes: AnimeEpisode[];
  idMal: number | null;
  seasonNumber: number;
  verified: boolean;
}> {
  // 1. Retrieve AniList Info
  const { idMal, episodesCount } = await fetchAniListMediaInfo(anilistId);

  // 2. Check Season Mapping
  let seasonNumber = 1;
  let verified = false;

  try {
    const mapping = await AnimeSeasonMapping.findOne({ anilistId });
    if (mapping) {
      seasonNumber = mapping.seasonNumber || 1;
      verified = mapping.verified;
    }
  } catch (err) {
    console.warn('[Season Mapping Read Warning]:', err);
  }

  let episodes: AnimeEpisode[] = [];

  // 3. Try fetching from Jikan if idMal exists
  if (idMal) {
    try {
      episodes = await fetchEpisodesFromJikan(idMal, seasonNumber);
    } catch (jikanError) {
      console.log(`[Jikan Unavailable] Falling back to generic episodes for AniList ID ${anilistId}`);
      episodes = generateFallbackEpisodes(episodesCount || 12, seasonNumber);
    }
  } else {
    console.log(`[No MAL ID] Using fallback episode generator for AniList ID ${anilistId}`);
    episodes = generateFallbackEpisodes(episodesCount || 12, seasonNumber);
  }

  // 4. Attach discussion statistics from DB
  try {
    const discussions = await EpisodeDiscussion.find({ anilistId });
    const discussionMap = new Map<number, { commentCount: number; participantCount: number; lastActivityAt: Date }>();

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
    idMal,
    seasonNumber,
    verified,
  };
}
