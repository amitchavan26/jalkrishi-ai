export async function searchPlaces(parts, { delayMs = 1100, fetchImpl = (...a) => fetch(...a) } = {}) {
  const country = (parts.country || '').trim();
  const state = (parts.state || '').trim();
  const district = (parts.district || '').trim();
  const taluka = (parts.taluka || '').trim();
  const village = (parts.village || '').trim();

  const queryParts = [village, taluka, district, state, country].filter(Boolean);
  const query = queryParts.join(', ');

  if (!query) {
    return [];
  }

  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=en&q=' + encodeURIComponent(query);

  const response = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('Search failed');
  }

  const data = await response.json();
  const results = data.map(item => ({
    label: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon)
  }));

  if (results.length === 0 && taluka) {
    await new Promise(r => setTimeout(r, delayMs));

    const retryQueryParts = [village, district, state, country].filter(Boolean);
    const retryQuery = retryQueryParts.join(', ');

    if (!retryQuery) {
      return [];
    }

    const retryUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=en&q=' + encodeURIComponent(retryQuery);
    const retryResponse = await fetchImpl(retryUrl, { headers: { Accept: 'application/json' } });
    if (!retryResponse.ok) {
      throw new Error('Search failed');
    }

    const retryData = await retryResponse.json();
    return retryData.map(item => ({
      label: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon)
    }));
  }

  return results;
}