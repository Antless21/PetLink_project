import { useEffect, useState } from 'react';
import { geocodeCity, getCachedCity, haversineKm, type Coords } from './geo';

export function useCityCoords(city: string | undefined | null): Coords | null {
  const initial = city ? getCachedCity(city) : null;
  const [coords, setCoords] = useState<Coords | null>(initial);

  useEffect(() => {
    if (!city) {
      setCoords(null);
      return;
    }
    const cached = getCachedCity(city);
    if (cached) {
      setCoords(cached);
      return;
    }
    let cancelled = false;
    geocodeCity(city).then((res) => {
      if (!cancelled) setCoords(res);
    });
    return () => {
      cancelled = true;
    };
  }, [city]);

  return coords;
}

export function useCitiesDistances(
  userCity: string | undefined | null,
  cities: string[],
): Record<string, number> {
  const userCoords = useCityCoords(userCity);
  const [distances, setDistances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userCoords) {
      setDistances({});
      return;
    }

    let cancelled = false;
    const uniqueCities = Array.from(
      new Set(
        cities
          .map((c) => c?.trim())
          .filter((c): c is string => Boolean(c) && c.toLowerCase() !== 'не указан'),
      ),
    );

    const initial: Record<string, number> = {};
    const toFetch: string[] = [];

    for (const city of uniqueCities) {
      const cached = getCachedCity(city);
      if (cached) {
        initial[city] = haversineKm(userCoords, cached);
      } else {
        toFetch.push(city);
      }
    }
    setDistances(initial);

    if (toFetch.length === 0) return;

    (async () => {
      const result = { ...initial };
      for (const city of toFetch) {
        if (cancelled) return;
        const coords = await geocodeCity(city);
        if (coords) {
          result[city] = haversineKm(userCoords, coords);
          if (!cancelled) setDistances({ ...result });
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userCoords, cities.join('|')]);

  return distances;
}
