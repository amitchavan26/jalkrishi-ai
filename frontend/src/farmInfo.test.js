import { describe, it, expect } from 'vitest';
import { locationLine, waterChips } from './farmInfo';

describe('farmInfo', () => {
  it('locationLineJoinsNonEmptyParts', () => {
    expect(
      locationLine({
        village: 'Pimpalgaon',
        taluka: '',
        district: 'Nashik',
        state: 'Maharashtra',
        country: 'India',
      })
    ).toBe('Pimpalgaon, Nashik, Maharashtra, India');
    expect(locationLine({})).toBe('');
  });

  it('waterChipsListsPerDayAndTotals', () => {
    expect(
      waterChips({
        storedWaterLitres: 100000,
        groundwaterLitresPerDay: 20000,
      })
    ).toEqual([
      'Stored water 100,000 L total',
      'Groundwater 20,000 L/day',
    ]);
    expect(waterChips({})).toEqual([]);
  });
});