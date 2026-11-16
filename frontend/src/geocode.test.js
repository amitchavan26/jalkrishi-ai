import { describe, it, expect, vi } from 'vitest';
import { searchPlaces } from './geocode';

describe('searchPlaces', () => {
  it('buildsQueryFromMostSpecificToLeast', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ display_name: 'X', lat: '20.07', lon: '73.98' }]
    });

    const result = await searchPlaces(
      { country: 'India', state: 'Maharashtra', district: 'Nashik', taluka: 'Niphad', village: 'Pimpalgaon' },
      { fetchImpl, delayMs: 0 }
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const calledUrl = fetchImpl.mock.calls[0][0];
    expect(calledUrl).toContain(encodeURIComponent('Pimpalgaon, Niphad, Nashik, Maharashtra, India'));
    expect(result).toEqual([{ label: 'X', lat: 20.07, lon: 73.98 }]);
  });

  it('retriesWithoutTalukaWhenEmpty', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ display_name: 'Y', lat: '20.1', lon: '73.95' }] });

    const result = await searchPlaces(
      { country: 'India', state: 'Maharashtra', district: 'Nashik', taluka: 'Niphad', village: 'Pimpalgaon' },
      { fetchImpl, delayMs: 0 }
    );

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const secondUrl = fetchImpl.mock.calls[1][0];
    expect(secondUrl).toContain(encodeURIComponent('Pimpalgaon, Nashik, Maharashtra, India'));
    expect(secondUrl).not.toContain('Niphad');
    expect(result).toEqual([{ label: 'Y', lat: 20.1, lon: 73.95 }]);
  });

  it('throwsWhenServerFails', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 });

    await expect(searchPlaces({ village: 'X' }, { fetchImpl, delayMs: 0 })).rejects.toThrow();
  });
});