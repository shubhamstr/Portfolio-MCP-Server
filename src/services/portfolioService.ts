import { DbData } from '../types/index.js';
import { PORTFOLIO_DATA_URL, CACHE_TTL_MS } from '../config/index.js';

let cachedData: DbData | null = null;
let lastFetchTime = 0;

export async function getPortfolioData(forceRefresh = false): Promise<DbData> {
  const now = Date.now();
  if (!forceRefresh && cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const res = await fetch(PORTFOLIO_DATA_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'portfolio-mcp-server/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch portfolio data: HTTP ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as DbData;
    cachedData = data;
    lastFetchTime = now;
    return data;
  } catch (err) {
    if (cachedData) {
      console.warn('Network error while refreshing portfolio data, using cached copy:', err);
      return cachedData;
    }
    throw err;
  }
}
