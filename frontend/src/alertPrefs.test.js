import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KEY, loadPrefs, savePrefs, isHidden, hide, snooze, clearAll } from './alertPrefs';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('alertPrefs', () => {
  it('hideIsPermanent', () => {
    const p = hide({}, 'a1');
    expect(isHidden(p, 'a1', 5)).toBe(true);
    expect(isHidden(p, 'a1', 4e15)).toBe(true);
    expect(isHidden(p, 'a2', 5)).toBe(false);
  });

  it('snoozeExpires', () => {
    const p = snooze({}, 'a1', 1000, 86400000);
    expect(isHidden(p, 'a1', 1000 + 86399999)).toBe(true);
    expect(isHidden(p, 'a1', 1000 + 86400000)).toBe(false);
  });

  it('badStorageGivesEmptyPrefs', () => {
    localStorage.setItem(KEY, 'not json');
    expect(loadPrefs()).toEqual({});
  });

  it('roundTrips', () => {
    savePrefs(hide({}, 'a1'));
    expect(loadPrefs()).toEqual({ a1: Number.MAX_SAFE_INTEGER });
  });
});