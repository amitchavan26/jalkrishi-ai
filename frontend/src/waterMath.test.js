import { describe, it, expect } from 'vitest';
import { acresToHa, bucketToPerDay, tankLitres, perDayFromTotal } from './waterMath';

describe('waterMath', () => {
  it('bucketGivesPerDay', () => {
    const result = bucketToPerDay({ bucketLitres: 20, seconds: 15, hoursPerDay: 4 });
    expect(result).toEqual({ litresPerMinute: 80, litresPerDay: 19200 });
  });

  it('tankInMetres', () => {
    expect(tankLitres({ length: 20, width: 10, depth: 2, unit: 'm' })).toBe(400000);
    expect(perDayFromTotal(400000, 60)).toBe(6667);
  });

  it('tankInFeet', () => {
    expect(tankLitres({ length: 10, width: 10, depth: 5, unit: 'ft' })).toBe(14158);
  });

  it('acresConvertToHectares', () => {
    expect(acresToHa(10)).toBe(4.0469);
    expect(acresToHa(1)).toBe(0.4047);
  });

  it('invalidInputsGiveNull', () => {
    expect(bucketToPerDay({ bucketLitres: 20, seconds: 0, hoursPerDay: 4 })).toBeNull();
    expect(tankLitres({ length: 0, width: 1, depth: 1, unit: 'm' })).toBeNull();
    expect(perDayFromTotal(100, 0)).toBeNull();
  });
});