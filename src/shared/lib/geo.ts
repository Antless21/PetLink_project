export interface Coords {
  lat: number;
  lng: number;
}

interface CacheEntry {
  coords: Coords | null;
  ts: number;
}

const CACHE_KEY = 'pet_app_geo_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function loadCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, CacheEntry>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* noop */
  }
}

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

const pendingRequests = new Map<string, Promise<Coords | null>>();

async function fetchFromNominatim(city: string): Promise<Coords | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', city);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '0');
  url.searchParams.set('accept-language', 'ru,en');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export async function geocodeCity(city: string): Promise<Coords | null> {
  const key = normalizeCity(city);
  if (!key || key === 'не указан') return null;

  const cache = loadCache();
  const cached = cache[key];
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.coords;
  }

  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const request = (async () => {
    const coords = await fetchFromNominatim(city);
    const fresh = loadCache();
    fresh[key] = { coords, ts: Date.now() };
    saveCache(fresh);
    pendingRequests.delete(key);
    return coords;
  })();

  pendingRequests.set(key, request);
  return request;
}

export function getCachedCity(city: string): Coords | null {
  const key = normalizeCity(city);
  if (!key || key === 'не указан') return null;
  const cache = loadCache();
  const cached = cache[key];
  if (!cached) return null;
  if (Date.now() - cached.ts > CACHE_TTL_MS) return null;
  return cached.coords;
}

export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDistance(km: number): string {
  if (km < 1) return 'менее 1 км';
  if (km < 10) return `${km.toFixed(1)} км`;
  if (km < 1000) return `${Math.round(km)} км`;
  return `${Math.round(km / 100) / 10} тыс. км`;
}

export async function prefetchCities(cities: string[]): Promise<void> {
  const unique = Array.from(new Set(cities.map(normalizeCity).filter(Boolean)));
  for (const city of unique) {
    const cached = getCachedCity(city);
    if (cached !== null) continue;
    await geocodeCity(city);
    await new Promise((r) => setTimeout(r, 1100));
  }
}
