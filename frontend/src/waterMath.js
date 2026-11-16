export function acresToHa(acres) {
  return Math.round(Number(acres) * 0.404686 * 10000) / 10000;
}

export function bucketToPerDay({ bucketLitres, seconds, hoursPerDay }) {
  if (!Number.isFinite(bucketLitres) || bucketLitres <= 0) return null;
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0) return null;
  const litresPerMinute = (bucketLitres / seconds) * 60;
  const litresPerDay = Math.round(
    (bucketLitres / seconds) * 60 * hoursPerDay * 60,
  );
  return { litresPerMinute, litresPerDay };
}

export function tankLitres({ length, width, depth, unit }) {
  if (!Number.isFinite(length) || length <= 0) return null;
  if (!Number.isFinite(width) || width <= 0) return null;
  if (!Number.isFinite(depth) || depth <= 0) return null;
  const litres = length * width * depth * (unit === "ft" ? 28.316846592 : 1000);
  return Math.round(litres);
}

export function perDayFromTotal(totalLitres, days) {
  if (!Number.isFinite(totalLitres) || totalLitres <= 0) return null;
  if (!Number.isFinite(days) || days <= 0) return null;
  return Math.round(totalLitres / days);
}

export function haToAcres(ha) {
  const n = Number(ha);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round((n / 0.404686) * 100) / 100;
}
