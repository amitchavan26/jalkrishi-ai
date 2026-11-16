export const KEY = 'jk_hidden_alerts';

export function loadPrefs() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function isHidden(prefs, id, now = Date.now()) {
  return Number(prefs[id]) > now;
}

export function hide(prefs, id) {
  return { ...prefs, [id]: Number.MAX_SAFE_INTEGER };
}

export function snooze(prefs, id, now, ms) {
  return { ...prefs, [id]: now + ms };
}

export function clearAll() {
  return {};
}