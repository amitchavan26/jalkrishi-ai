import { describe, it, expect } from 'vitest';
import { haToAcres } from './waterMath';

describe('waterMath area conversion', () => {
  it('haToAcresConverts', () => {
    expect(haToAcres(2.5)).toBe(6.18);
    expect(haToAcres(0)).toBe(0);
    expect(haToAcres(-1)).toBeNull();
    expect(haToAcres('abc')).toBeNull();
  });
});