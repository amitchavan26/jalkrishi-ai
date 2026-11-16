export function locationLine(farm) {
  const parts = [
    farm?.village,
    farm?.taluka,
    farm?.district,
    farm?.state,
    farm?.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export function waterChips(farm) {
  const chips = [];
  const storedPerDay = farm?.storedWaterLitresPerDay || 0;
  const storedTotal = farm?.storedWaterLitres || 0;
  const groundPerDay = farm?.groundwaterLitresPerDay || 0;
  const groundTotal = farm?.groundwaterLitres || 0;

  if (storedPerDay > 0) {
    chips.push(`Stored water ${storedPerDay.toLocaleString('en-US')} L/day`);
  }
  if (storedTotal > 0) {
    chips.push(`Stored water ${storedTotal.toLocaleString('en-US')} L total`);
  }
  if (groundPerDay > 0) {
    chips.push(`Groundwater ${groundPerDay.toLocaleString('en-US')} L/day`);
  }
  if (groundTotal > 0) {
    chips.push(`Groundwater ${groundTotal.toLocaleString('en-US')} L total`);
  }
  return chips;
}