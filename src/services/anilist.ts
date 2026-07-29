/**
 * AniList GraphQL API Service for OtakuVerse
 * Official Endpoint: https://graphql.anilist.co
 */

// Strongly typed interfaces as requested
export interface Title {
  english?: string;
  romaji?: string;
  native?: string;
  userPreferred?: string;
}

export interface CoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface AniListStudioNode {
  id: number;
  name: string;
  isAnimationStudio?: boolean;
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

export interface Anime {
  id: number;
  title: Title;
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
  coverImage?: CoverImage;
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

// Aliases for backward compatibility
export type AniListMedia = Anime;
export type AniListTitle = Title;
export type AniListCoverImage = CoverImage;

export interface AniListApiResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export interface AniListPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AniListFetchResult {
  media: Anime[];
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
 * Default OtakuVerse placeholder image when cover image is missing
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
 * Default OtakuVerse placeholder banner image
 */
export function getFallbackBanner(title?: string): string {
  const safeTitle = (title || 'OtakuVerse').substring(0, 32);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
    <rect width="1200" height="400" fill="#0E1410"/>
    <rect x="20" y="20" width="1160" height="360" rx="12" fill="none" stroke="#23382C" stroke-width="4"/>
    <circle cx="600" cy="200" r="110" fill="#25663E" opacity="0.3"/>
    <text x="600" y="190" font-family="'Cinzel', serif" font-size="42" font-weight="extrabold" fill="#C5A059" text-anchor="middle">OTAKUVERSE ARCHIVE</text>
    <text x="600" y="235" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Reusable GraphQL Client helper using fetch API
 * Logs complete GraphQL errors to console and throws descriptive errors
 */
async function fetchAniListGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  signal?: AbortSignal
): Promise<T> {
  const cacheKey = `${CACHE_PREFIX}${JSON.stringify({ query, variables })}`;
  
  // Check in-memory cache
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

  let response: Response;
  try {
    response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal,
    });
  } catch (fetchError: any) {
    if (fetchError.name === 'AbortError' || signal?.aborted) {
      throw fetchError;
    }
    console.error('AniList Network Error:', fetchError);
    console.error('[AniList API Error Details]:', {
      httpStatus: 0,
      graphQLErrors: null,
      requestedAnimeId: variables?.id ?? null,
      responseBody: fetchError.message || 'Fetch failed',
    });
    throw new Error('Unable to connect to AniList servers. Please check your internet connection.');
  }

  if (!response.ok) {
    let responseText = '';
    try {
      responseText = await response.text();
    } catch (e) {
      responseText = response.statusText;
    }

    console.error('[AniList API Error Details]:', {
      httpStatus: response.status,
      graphQLErrors: null,
      requestedAnimeId: variables?.id ?? null,
      responseBody: responseText,
    });

    if (response.status === 429) {
      throw new Error('AniList is receiving too many requests. Please wait a moment and try again.');
    }

    throw new Error(`AniList service returned HTTP error status ${response.status} (${response.statusText}).`);
  }

  const json: AniListApiResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    // Print complete GraphQL error details to browser console as required
    console.error('[AniList GraphQL Error Details]:', {
      httpStatus: response.status,
      graphQLErrors: json.errors,
      requestedAnimeId: variables?.id ?? null,
      responseBody: json,
    });

    const errorMessages = json.errors.map((e) => e.message).join(' | ');
    throw new Error(`AniList GraphQL Error: ${errorMessages}`);
  }

  if (!json.data) {
    throw new Error('AniList API returned an empty response.');
  }

  const result = json.data;

  // Save successful response to cache
  const cacheEntry = { timestamp: Date.now(), data: result };
  memoryCache.set(cacheKey, cacheEntry);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (e) {
    // LocalStorage full or blocked
  }

  return result;
}

/**
 * Clear cache for a specific media ID or all cache entries
 */
export function clearAniListCache(id?: number | string) {
  if (!id) {
    memoryCache.clear();
    return;
  }
  const numericId = Number(id);
  for (const key of memoryCache.keys()) {
    if (key.includes(`"id":${numericId}`)) {
      memoryCache.delete(key);
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  }
}

// Media Fields Fragment for Card Listing
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
 * Retrieves current trending anime using the specified GraphQL query.
 * Returns array of anime (result.data.Page.media) with pageInfo attached.
 */
export async function getTrendingAnime(page = 1, perPage = 12): Promise<Anime[] & { media: Anime[]; pageInfo: AniListPageInfo }> {
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
        media(
          type: ANIME
          sort: TRENDING_DESC
          isAdult: false
        ) {
          id

          title {
            english
            romaji
            native
          }

          coverImage {
            extraLarge
            large
          }

          bannerImage

          description(asHtml: false)

          averageScore

          episodes

          status

          genres

          season

          seasonYear
        }
      }
    }
  `;

  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: Anime[] } }>(query, { page, perPage });
  const mediaList = res.Page.media;

  // Ensure fallback cover and banner handling for items without images
  mediaList.forEach((item) => {
    if (!item.coverImage?.large && !item.coverImage?.extraLarge) {
      item.coverImage = {
        extraLarge: getFallbackCover(item.title?.english || item.title?.romaji),
        large: getFallbackCover(item.title?.english || item.title?.romaji),
      };
    }
  });

  // Attach pageInfo and media properties to the array so both array methods and object destructuring work seamlessly
  return Object.assign(mediaList, {
    media: mediaList,
    pageInfo: res.Page.pageInfo,
  });
}

/**
 * 2. getPopularAnime
 */
export async function getPopularAnime(page = 1, perPage = 12): Promise<Anime[] & { media: Anime[]; pageInfo: AniListPageInfo }> {
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
  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: Anime[] } }>(query, { page, perPage });
  const mediaList = res.Page.media;
  return Object.assign(mediaList, { media: mediaList, pageInfo: res.Page.pageInfo });
}

/**
 * 3. searchAnime
 */
export async function searchAnime(
  searchTerm: string,
  page = 1,
  perPage = 12,
  filters: { genre?: string; format?: string; status?: string; sort?: string } = {}
): Promise<Anime[] & { media: Anime[]; pageInfo: AniListPageInfo }> {
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

  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: Anime[] } }>(query, variables);
  const mediaList = res.Page.media;
  return Object.assign(mediaList, { media: mediaList, pageInfo: res.Page.pageInfo });
}

/**
 * 4. getAnimeById
 */
export async function getAnimeById(id: number | string, signal?: AbortSignal): Promise<Anime> {
  const numericId = Number(id);
  if (!id || isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId) || String(id) === 'undefined' || String(id) === 'null') {
    throw new Error(`Invalid anime ID provided: "${id}". ID must be a positive integer.`);
  }

  const query = `
    query MediaById($id: Int!) {
      Media(id: $id, type: ANIME) {
        ${FULL_MEDIA_FRAGMENT}
      }
    }
  `;

  const res = await fetchAniListGraphQL<{ Media: Anime }>(
    query,
    { id: Number(id) },
    signal
  );

  if (!res || !res.Media) {
    throw new Error(`Anime title with ID ${id} was not found on AniList.`);
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
): Promise<Anime[] & { media: Anime[]; pageInfo: AniListPageInfo }> {
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
  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: Anime[] } }>(
    query,
    { season: currentSeason.toUpperCase(), seasonYear: currentYear, page, perPage }
  );
  const mediaList = res.Page.media;
  return Object.assign(mediaList, { media: mediaList, pageInfo: res.Page.pageInfo });
}

/**
 * 6. getAnimeRecommendations
 */
export async function getAnimeRecommendations(id: number | string): Promise<Anime[]> {
  const anime = await getAnimeById(id);
  const recs = anime.recommendations?.nodes || [];
  return recs
    .map((r) => r.mediaRecommendation)
    .filter((m): m is Anime => Boolean(m && m.id));
}

/**
 * 7. getPopularManga
 */
export async function getPopularManga(page = 1, perPage = 12): Promise<Anime[] & { media: Anime[]; pageInfo: AniListPageInfo }> {
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
  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: Anime[] } }>(query, { page, perPage });
  const mediaList = res.Page.media;
  return Object.assign(mediaList, { media: mediaList, pageInfo: res.Page.pageInfo });
}

/**
 * 8. searchManga
 */
export async function searchManga(
  searchTerm: string,
  page = 1,
  perPage = 12,
  filters: { genre?: string; format?: string; status?: string; sort?: string } = {}
): Promise<Anime[] & { media: Anime[]; pageInfo: AniListPageInfo }> {
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

  const res = await fetchAniListGraphQL<{ Page: { pageInfo: AniListPageInfo; media: Anime[] } }>(query, variables);
  const mediaList = res.Page.media;
  return Object.assign(mediaList, { media: mediaList, pageInfo: res.Page.pageInfo });
}

/**
 * 9. getMangaById
 */
export async function getMangaById(id: number | string, signal?: AbortSignal): Promise<Anime> {
  const numericId = Number(id);
  if (!id || isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId) || String(id) === 'undefined' || String(id) === 'null') {
    throw new Error(`Invalid manga ID provided: "${id}". ID must be a positive integer.`);
  }

  const query = `
    query MediaById($id: Int!) {
      Media(id: $id, type: MANGA) {
        ${FULL_MEDIA_FRAGMENT}
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Media: Anime }>(
    query,
    { id: Number(id) },
    signal
  );
  if (!res || !res.Media) {
    throw new Error(`Manga title with ID ${id} was not found on AniList.`);
  }
  return res.Media;
}

/**
 * Generic getMediaById (handles either ANIME or MANGA)
 */
export async function getMediaById(id: number | string, signal?: AbortSignal): Promise<Anime> {
  const numericId = Number(id);
  if (!id || isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId) || String(id) === 'undefined' || String(id) === 'null') {
    throw new Error(`Invalid media ID provided: "${id}". ID must be a positive integer.`);
  }

  const query = `
    query MediaById($id: Int!) {
      Media(id: $id) {
        ${FULL_MEDIA_FRAGMENT}
      }
    }
  `;
  const res = await fetchAniListGraphQL<{ Media: Anime }>(
    query,
    { id: Number(id) },
    signal
  );
  if (!res || !res.Media) {
    throw new Error(`Media title with ID ${id} was not found on AniList.`);
  }
  return res.Media;
}
