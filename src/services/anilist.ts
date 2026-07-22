/**
 * AniList GraphQL API Service
 * Endpoint: https://graphql.anilist.co
 */

export interface AniListTitle {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export interface AniListCoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface AniListStudioNode {
  id: number;
  name: string;
  isAnimationStudio: boolean;
}

export interface AniListStudio {
  nodes?: AniListStudioNode[];
}

export interface AniListCharacterNode {
  id: number;
  name: {
    full?: string;
    native?: string;
  };
  image?: {
    large?: string;
    medium?: string;
  };
}

export interface AniListVoiceActor {
  id: number;
  name: {
    full?: string;
  };
  image?: {
    large?: string;
  };
}

export interface AniListCharacterEdge {
  role?: string;
  node: AniListCharacterNode;
  voiceActors?: AniListVoiceActor[];
}

export interface AniListCharacters {
  edges?: AniListCharacterEdge[];
}

export interface AniListRecommendationNode {
  mediaRecommendation?: AniListMedia;
}

export interface AniListRecommendations {
  nodes?: AniListRecommendationNode[];
}

export interface AniListExternalLink {
  id: number;
  url: string;
  site: string;
  type?: string;
  icon?: string;
  color?: string;
}

export interface AniListStreamingEpisode {
  title?: string;
  thumbnail?: string;
  url?: string;
  site?: string;
}

export interface AniListTag {
  id: number;
  name: string;
  category?: string;
  rank?: number;
  description?: string;
}

export interface AniListAiringEpisode {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

export interface AniListReviewNode {
  id: number;
  summary?: string;
  rating?: number;
  user?: {
    name?: string;
    avatar?: {
      medium?: string;
    };
  };
}

export interface AniListMedia {
  id: number;
  title: AniListTitle;
  type: 'ANIME' | 'MANGA';
  format?: string;
  status?: string;
  description?: string;
  startDate?: { year?: number; month?: number; day?: number };
  endDate?: { year?: number; month?: number; day?: number };
  season?: string;
  seasonYear?: number;
  episodes?: number;
  duration?: number;
  chapters?: number;
  volumes?: number;
  countryOfOrigin?: string;
  coverImage?: AniListCoverImage;
  bannerImage?: string;
  genres?: string[];
  synonyms?: string[];
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  trending?: number;
  favourites?: number;
  tags?: AniListTag[];
  studios?: AniListStudio;
  characters?: AniListCharacters;
  recommendations?: AniListRecommendations;
  externalLinks?: AniListExternalLink[];
  streamingEpisodes?: AniListStreamingEpisode[];
  nextAiringEpisode?: AniListAiringEpisode;
  reviews?: {
    nodes?: AniListReviewNode[];
  };
}

export interface AniListPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AniListFetchResult {
  media: AniListMedia[];
  pageInfo: AniListPageInfo;
}

const ANILIST_URL = 'https://graphql.anilist.co';
const CACHE_PREFIX = 'otakuverse_anilist_cache_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

// In-memory runtime cache
const memoryCache = new Map<string, { timestamp: number; data: any }>();

/**
 * Remove HTML tags such as <br>, <i>, <b>, <p> from AniList descriptions
 */
export function cleanDescription(html?: string): string {
  if (!html) return 'No description available for this title.';
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<i>(.*?)<\/i>/gi, '$1')
    .replace(/<b>(.*?)<\/b>/gi, '$1')
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  return text || 'No description available for this title.';
}

/**
 * Return fallback SVG cover image data URL when cover is missing
 */
export function getFallbackCover(title?: string): string {
  const safeTitle = (title || 'OtakuVerse').substring(0, 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <rect width="300" height="450" fill="#0E1410"/>
    <rect x="15" y="15" width="270" height="420" rx="8" fill="none" stroke="#389B5F" stroke-width="2"/>
    <circle cx="150" cy="180" r="60" fill="#25663E" opacity="0.6"/>
    <circle cx="150" cy="180" r="45" fill="none" stroke="#C5A059" stroke-width="3"/>
    <text x="150" y="185" font-family="'Cinzel', serif" font-size="28" font-weight="bold" fill="#C5A059" text-anchor="middle">知恵</text>
    <text x="150" y="280" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeTitle}</text>
    <text x="150" y="310" font-family="sans-serif" font-size="12" fill="#A3C2AE" text-anchor="middle">OTAKUVERSE ARCHIVE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * GraphQL Client helper with caching
 */
async function fetchAniListGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const cacheKey = `${CACHE_PREFIX}${JSON.stringify({ query, variables })}`;
  
  // Check memory cache
  const mem = memoryCache.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL_MS) {
    return mem.data as T;
  }

  // Check localStorage cache
  try {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      const parsed = JSON.parse(local);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(cacheKey, parsed);
        return parsed.data as T;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // Fetch live API
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`AniList API returned HTTP error ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(`AniList GraphQL Error: ${json.errors[0].message}`);
  }

  const result = json.data as T;

  // Save to cache
  const cacheEntry = { timestamp: Date.now(), data: result };
  memoryCache.set(cacheKey, cacheEntry);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (e) {
    // LocalStorage full or blocked
  }

  return result;
}

// Media Fields Query Fragment
const MEDIA_CARD_FRAGMENT = `
  id
  title {
    romaji
    english
    native
    userPreferred
  }
  type
  format
  status
  description(asHtml: false)
  startDate { year month day }
  season
  seasonYear
  episodes
  duration
  chapters
  volumes
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  genres
  averageScore
  meanScore
  popularity
  trending
  favourites
  studios(isMain: true) {
    nodes {
      id
      name
    }
  }
`;

const FULL_MEDIA_FRAGMENT = `
  ${MEDIA_CARD_FRAGMENT}
  endDate { year month day }
  countryOfOrigin
  synonyms
  tags {
    id
    name
    category
    rank
    description
  }
  studios {
    nodes {
      id
      name
      isAnimationStudio
    }
  }
  characters(perPage: 12, sort: [ROLE, RELEVANCE]) {
    edges {
      role
      node {
        id
        name { full native }
        image { large medium }
      }
      voiceActors(language: JAPANESE) {
        id
        name { full }
        image { large }
      }
    }
  }
  recommendations(perPage: 8, sort: [RATING_DESC]) {
    nodes {
      mediaRecommendation {
        id
        title { userPreferred english romaji }
        coverImage { large medium }
        averageScore
        format
        type
      }
    }
  }
  externalLinks {
    id
    url
    site
    type
    icon
    color
  }
  streamingEpisodes {
    title
    thumbnail
    url
    site
  }
  nextAiringEpisode {
    airingAt
    timeUntilAiring
    episode
  }
  reviews(perPage: 4, sort: [RATING_DESC]) {
    nodes {
      id
      summary
      rating
      user {
        name
        avatar { medium }
      }
    }
  }
`;

/**
 * 1. getTrendingAnime
 */
export async function getTrendingAnime(page = 1, perPage = 12): Promise<AniListFetchResult> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC], isAdult: false) {
          ${MEDIA_CARD_FRAGMENT}
        }
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(query, { page, perPage });
  return { media: res.Page.media, pageInfo: res.Page.pageInfo };
}

/**
 * 2. getPopularAnime
 */
export async function getPopularAnime(page = 1, perPage = 12): Promise<AniListFetchResult> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(type: ANIME, sort: [POPULARITY_DESC], isAdult: false) {
          ${MEDIA_CARD_FRAGMENT}
        }
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(query, { page, perPage });
  return { media: res.Page.media, pageInfo: res.Page.pageInfo };
}

/**
 * 3. searchAnime
 */
export async function searchAnime(
  searchTerm: string,
  page = 1,
  perPage = 12,
  filters: { genre?: string; format?: string; status?: string; sort?: string } = {}
): Promise<AniListFetchResult> {
  const sortOption = filters.sort ? [filters.sort] : (searchTerm ? ['SEARCH_MATCH'] : ['POPULARITY_DESC']);
  const query = `
    query ($page: Int, $perPage: Int, $search: String, $genre: String, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(
          type: ANIME,
          search: $search,
          genre: $genre,
          format: $format,
          status: $status,
          sort: $sort,
          isAdult: false
        ) {
          ${MEDIA_CARD_FRAGMENT}
        }
      }
    }
  `;
  const variables: Record<string, any> = {
    page,
    perPage,
    search: searchTerm.trim() || undefined,
    genre: filters.genre && filters.genre !== 'All' ? filters.genre : undefined,
    format: filters.format && filters.format !== 'All' ? filters.format : undefined,
    status: filters.status && filters.status !== 'All' ? filters.status : undefined,
    sort: sortOption,
  };

  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(query, variables);
  return { media: res.Page.media, pageInfo: res.Page.pageInfo };
}

/**
 * 4. getAnimeById
 */
export async function getAnimeById(id: number | string): Promise<AniListMedia> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${FULL_MEDIA_FRAGMENT}
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Media: AniListMedia }>(query, { id: numericId });
  if (!res || !res.Media) {
    throw new Error(`Anime with ID ${id} was not found on AniList.`);
  }
  return res.Media;
}

/**
 * 5. getSeasonalAnime
 */
export async function getSeasonalAnime(
  season?: string,
  year?: number,
  page = 1,
  perPage = 12
): Promise<AniListFetchResult> {
  // Determine current season & year if omitted
  const now = new Date();
  const currentYear = year || now.getFullYear();
  let currentSeason = season;
  if (!currentSeason) {
    const month = now.getMonth();
    if (month >= 0 && month <= 2) currentSeason = 'WINTER';
    else if (month >= 3 && month <= 5) currentSeason = 'SPRING';
    else if (month >= 6 && month <= 8) currentSeason = 'SUMMER';
    else currentSeason = 'FALL';
  }

  const query = `
    query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC], isAdult: false) {
          ${MEDIA_CARD_FRAGMENT}
        }
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(
    query,
    { season: currentSeason.toUpperCase(), seasonYear: currentYear, page, perPage }
  );
  return { media: res.Page.media, pageInfo: res.Page.pageInfo };
}

/**
 * 6. getAnimeRecommendations
 */
export async function getAnimeRecommendations(id: number | string): Promise<AniListMedia[]> {
  const anime = await getAnimeById(id);
  const recs = anime.recommendations?.nodes || [];
  return recs
    .map((r) => r.mediaRecommendation)
    .filter((m): m is AniListMedia => Boolean(m && m.id));
}

/**
 * 7. getPopularManga
 */
export async function getPopularManga(page = 1, perPage = 12): Promise<AniListFetchResult> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(type: MANGA, sort: [POPULARITY_DESC], isAdult: false) {
          ${MEDIA_CARD_FRAGMENT}
        }
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(query, { page, perPage });
  return { media: res.Page.media, pageInfo: res.Page.pageInfo };
}

/**
 * 8. searchManga
 */
export async function searchManga(
  searchTerm: string,
  page = 1,
  perPage = 12,
  filters: { genre?: string; format?: string; status?: string; sort?: string } = {}
): Promise<AniListFetchResult> {
  const sortOption = filters.sort ? [filters.sort] : (searchTerm ? ['SEARCH_MATCH'] : ['POPULARITY_DESC']);
  const query = `
    query ($page: Int, $perPage: Int, $search: String, $genre: String, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(
          type: MANGA,
          search: $search,
          genre: $genre,
          format: $format,
          status: $status,
          sort: $sort,
          isAdult: false
        ) {
          ${MEDIA_CARD_FRAGMENT}
        }
      }
    }
  `;
  const variables: Record<string, any> = {
    page,
    perPage,
    search: searchTerm.trim() || undefined,
    genre: filters.genre && filters.genre !== 'All' ? filters.genre : undefined,
    format: filters.format && filters.format !== 'All' ? filters.format : undefined,
    status: filters.status && filters.status !== 'All' ? filters.status : undefined,
    sort: sortOption,
  };

  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(query, variables);
  return { media: res.Page.media, pageInfo: res.Page.pageInfo };
}

/**
 * 9. getMangaById
 */
export async function getMangaById(id: number | string): Promise<AniListMedia> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        ${FULL_MEDIA_FRAGMENT}
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Media: AniListMedia }>(query, { id: numericId });
  if (!res || !res.Media) {
    throw new Error(`Manga with ID ${id} was not found on AniList.`);
  }
  return res.Media;
}

/**
 * Generic getMediaById (handles either ANIME or MANGA)
 */
export async function getMediaById(id: number | string): Promise<AniListMedia> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const query = `
    query ($id: Int) {
      Media(id: $id) {
        ${FULL_MEDIA_FRAGMENT}
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Media: AniListMedia }>(query, { id: numericId });
  if (!res || !res.Media) {
    throw new Error(`Media with ID ${id} was not found on AniList.`);
  }
  return res.Media;
}
