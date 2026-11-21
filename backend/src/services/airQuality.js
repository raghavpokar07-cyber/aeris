const OPEN_METEO_AQ = "https://air-quality-api.open-meteo.com/v1/air-quality";
const OPEN_METEO_WEATHER = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";
const OPENAQ_API = "https://api.openaq.org/v3/";
const WAQI_API = "https://api.waqi.info";
const OPEN_STREET_MAP_GEOCODING = "https://nominatim.openstreetmap.org/search";
const OPEN_STREET_MAP_OVERPASS = "https://overpass-api.de/api/interpreter";
const worldwideCities = require("cities.json");
const CITY_MAP_LOCATIONS = [
  { name: "New Delhi", country: "India", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639 },
  { name: "Bengaluru", country: "India", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707 },
  { name: "Hyderabad", country: "India", lat: 17.385, lon: 78.4867 },
  { name: "Ahmedabad", country: "India", lat: 23.0225, lon: 72.5714 },
  { name: "Pune", country: "India", lat: 18.5204, lon: 73.8567 },
  { name: "Jaipur", country: "India", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", country: "India", lat: 26.8467, lon: 80.9462 },
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lon: 85.324 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125 },
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297 },
  { name: "Hanoi", country: "Vietnam", lat: 21.0278, lon: 105.8342 },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737 },
  { name: "Hong Kong", country: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "London", country: "United Kingdom", lat: 51.5072, lon: -0.1276 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Sao Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631 },
  { name: "Perth", country: "Australia", lat: -31.9523, lon: 115.8613 },
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473 },
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898 },
  { name: "Accra", country: "Ghana", lat: 5.6037, lon: -0.187 },
  { name: "Addis Ababa", country: "Ethiopia", lat: 8.9806, lon: 38.7578 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207 },
  { name: "Chicago", country: "United States", lat: 41.8781, lon: -87.6298 },
  { name: "Houston", country: "United States", lat: 29.7604, lon: -95.3698 },
  { name: "Miami", country: "United States", lat: 25.7617, lon: -80.1918 },
  { name: "Seattle", country: "United States", lat: 47.6062, lon: -122.3321 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693 },
  { name: "Bogota", country: "Colombia", lat: 4.711, lon: -74.0721 },
  { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428 },
];

const WORLD_GRID_LOCATIONS = Array.from({ length: 240 }, (_, index) => {
  const latIndex = Math.floor(index / 20);
  const lonIndex = index % 20;
  const lat = Number((-60 + latIndex * 9).toFixed(1));
  const lon = Number((-170 + lonIndex * 18).toFixed(1));
  return {
    name: `AQI grid ${latIndex + 1}-${lonIndex + 1}`,
    country: "Global grid",
    lat,
    lon,
  };
});

const DATASET_CITY_LOCATIONS = [];
const seenCityNames = new Set(CITY_MAP_LOCATIONS.map((city) => city.name.toLowerCase()));
const citiesByCountry = new Map();
for (const city of worldwideCities) {
  const lat = Number(city.lat), lon = Number(city.lng);
  const name = String(city.name || "").trim();
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const key = name.toLowerCase();
  if (seenCityNames.has(key)) continue;
  const country = String(city.country || "Unknown").trim();
  if (!citiesByCountry.has(country)) citiesByCountry.set(country, []);
  citiesByCountry.get(country).push({ name, country, lat, lon });
  seenCityNames.add(key);
}

const countries = [...citiesByCountry.entries()].sort(([left], [right]) => left.localeCompare(right));
const datasetPerCountry = Math.max(1, Math.floor(2940 / Math.max(countries.length, 1)));
for (let round = 0; round < datasetPerCountry + 20 && DATASET_CITY_LOCATIONS.length < 2940; round++) {
  for (const [, cities] of countries) {
    if (round < cities.length && DATASET_CITY_LOCATIONS.length < 2940) {
      DATASET_CITY_LOCATIONS.push(cities[round]);
    }
  }
}

const MAP_LOCATIONS = [...CITY_MAP_LOCATIONS, ...DATASET_CITY_LOCATIONS];

let nominatimQueue = Promise.resolve();
let lastNominatimRequestAt = 0;
const regionCityCache = new Map();
const mapLocationCache = new Map();
const currentLocationCache = new Map();
const historyLocationCache = new Map();
let openMeteoRetryAt = 0;
let openMeteoDailyLimit = false;

async function fetchJson(url, headers = {}) {
  const isAirQualityProvider = url.startsWith(OPEN_METEO_AQ);
  if (isAirQualityProvider && Date.now() < openMeteoRetryAt) {
    const message = openMeteoDailyLimit
      ? "Daily API request limit exceeded. Please try again tomorrow."
      : "Environmental provider is temporarily rate-limited";
    throw Object.assign(new Error(message), { status: 429, dailyLimit: openMeteoDailyLimit });
  }
  const response = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  if (!response.ok) {
    if (isAirQualityProvider && response.status === 429) {
      const body = typeof response.json === "function" ? await response.json().catch(() => null) : null;
      const reason = typeof body?.reason === "string" ? body.reason : null;
      openMeteoDailyLimit = Boolean(reason && /daily api request limit exceeded/i.test(reason));
      if (openMeteoDailyLimit) {
        const now = new Date(Date.now());
        openMeteoRetryAt = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      } else {
        const retryAfter = Number(response.headers?.get?.("retry-after"));
        openMeteoRetryAt = Date.now() + Math.min(Math.max(retryAfter || 60, 30), 900) * 1000;
      }
      throw Object.assign(new Error(reason || `Environmental provider returned ${response.status}`), {
        status: 429,
        dailyLimit: openMeteoDailyLimit,
      });
    }
    throw Object.assign(new Error(`Environmental provider returned ${response.status}`), { status: response.status === 429 ? 429 : 502 });
  }
  if (isAirQualityProvider) {
    openMeteoRetryAt = 0;
    openMeteoDailyLimit = false;
  }
  return response.json();
}

async function fetchWaqi(path, token, params = {}) {
  const url = new URL(path, `${WAQI_API}/`);
  url.searchParams.set("token", token);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw Object.assign(new Error(`WAQI returned ${response.status}`), {
      status: response.status >= 500 ? 502 : response.status,
    });
  }
  const payload = await response.json();
  if (payload.status !== "ok") {
    throw Object.assign(new Error(typeof payload.data === "string" ? payload.data : "WAQI returned no station data"), {
      status: 502,
      provider: "WAQI",
    });
  }
  return payload.data;
}

function waqiToken() {
  return process.env.WAQI_API_TOKEN?.trim() || null;
}

async function fetchOpenAq(path, apiKey, params = {}) {
  const url = new URL(path.replace(/^\//, ""), OPENAQ_API);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-API-Key": apiKey },
  });
  if (!response.ok) {
    throw Object.assign(new Error(`OpenAQ returned ${response.status}`), {
      status: response.status >= 500 ? 502 : response.status,
    });
  }
  const payload = await response.json();
  if (Array.isArray(payload.results)) return payload.results;
  if (payload.results && typeof payload.results === "object") return [payload.results];
  throw Object.assign(new Error("OpenAQ returned invalid data"), { status: 502 });
}

const US_AQI_BREAKPOINTS = {
  pm25: [
    [0, 9, 0, 50],
    [9.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 125.4, 151, 200],
    [125.5, 225.4, 201, 300],
    [225.5, 325.4, 301, 500],
  ],
  pm10: [
    [0, 54, 0, 50],
    [55, 154, 51, 100],
    [155, 254, 101, 150],
    [255, 354, 151, 200],
    [355, 424, 201, 300],
    [425, 604, 301, 500],
  ],
};

function pollutantAqi(parameter, concentration) {
  if (!Number.isFinite(concentration) || concentration < 0) return null;
  const precision = parameter === "pm25" ? 10 : 1;
  const value = Math.floor(concentration * precision) / precision;
  const ranges = US_AQI_BREAKPOINTS[parameter];
  const range = ranges.find(([, upper]) => value <= upper);
  if (!range) return 500;
  const [lowConcentration, highConcentration, lowAqi, highAqi] = range;
  const boundedValue = Math.max(value, lowConcentration);
  return Math.round(
    ((highAqi - lowAqi) / (highConcentration - lowConcentration))
      * (boundedValue - lowConcentration)
      + lowAqi,
  );
}

function formatLocalHour(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:00`;
}

function isMicrogramsPerCubicMeter(sensor) {
  const units = String(sensor.parameter?.units || sensor.units || "")
    .replace(/[µμ]/g, "u")
    .replace("³", "3")
    .replace(/\s/g, "")
    .toLowerCase();
  return units === "ug/m3";
}

async function openAqHistory(lat, lon, apiKey) {
  const now = Date.now();
  const from = now - 24 * 60 * 60 * 1000;
  const locations = await fetchOpenAq("locations", apiKey, {
    coordinates: `${lat},${lon}`,
    radius: 25000,
    limit: 20,
  });
  const candidates = locations
    .filter((location) => {
      const lastReading = Date.parse(location.datetimeLast?.utc || "");
      return Number.isFinite(lastReading) && lastReading >= from && lastReading <= now;
    })
    .sort((left, right) => (left.distance ?? Infinity) - (right.distance ?? Infinity));

  for (const location of candidates) {
    const sensorCandidates = (location.sensors || []).filter((sensor) =>
      ["pm25", "pm10"].includes(String(sensor.parameter?.name || "").toLowerCase())
      && sensor.id != null,
    );
    if (!sensorCandidates.some((sensor) => String(sensor.parameter?.name).toLowerCase() === "pm25")) continue;

    const sensorDetails = await Promise.all(sensorCandidates.map(async (sensor) => {
      const [detail] = await fetchOpenAq(`sensors/${sensor.id}`, apiKey);
      if (!detail) return null;
      const parameter = String(detail.parameter?.name || sensor.parameter?.name || "").toLowerCase();
      const latest = Date.parse(detail.datetimeLast?.utc || "");
      if (!["pm25", "pm10"].includes(parameter) || !Number.isFinite(latest) || latest < from || latest > now) {
        return null;
      }
      const completeSensor = {
        ...detail,
        parameter: { ...detail.parameter, name: parameter, units: detail.parameter?.units || sensor.parameter?.units },
      };
      return isMicrogramsPerCubicMeter(completeSensor) ? { ...completeSensor, latest } : null;
    }));

    const selectedSensors = new Map();
    for (const sensor of sensorDetails.filter(Boolean)) {
      const current = selectedSensors.get(sensor.parameter.name);
      if (!current || sensor.latest > current.latest) selectedSensors.set(sensor.parameter.name, sensor);
    }
    const pm25Sensor = selectedSensors.get("pm25");
    if (!pm25Sensor) continue;

    const measurementResults = await Promise.all([...selectedSensors.entries()].map(async ([parameter, sensor]) => {
      const readings = await fetchOpenAq(`sensors/${sensor.id}/measurements`, apiKey, {
        datetime_from: new Date(from).toISOString(),
        datetime_to: new Date(now).toISOString(),
        limit: 1000,
      });
      return { parameter, readings };
    }));
    const hourlyValues = new Map();
    let updatedAt = null;
    let latestTimestamp = -Infinity;

    for (const { parameter, readings } of measurementResults) {
      for (const reading of readings) {
        if (reading.flagInfo?.hasFlags || reading.value == null) continue;
        const timestamp = Date.parse(reading.period?.datetimeFrom?.utc || reading.datetime?.utc || "");
        const value = Number(reading.value);
        if (!Number.isFinite(timestamp) || timestamp < from || timestamp > now || !Number.isFinite(value)) continue;
        const hour = Math.floor(timestamp / 3_600_000) * 3_600_000;
        if (!hourlyValues.has(hour)) hourlyValues.set(hour, { pm25: [], pm10: [] });
        hourlyValues.get(hour)[parameter].push(value);

        const periodEnd = reading.period?.datetimeTo;
        const endTimestamp = Date.parse(periodEnd?.utc || "");
        if (Number.isFinite(endTimestamp) && endTimestamp > latestTimestamp) {
          latestTimestamp = endTimestamp;
          updatedAt = periodEnd.local || periodEnd.utc;
        }
      }
    }

    if (!hourlyValues.size) continue;
    const timezone = location.timezone || "UTC";
    const latestHour = Math.floor(now / 3_600_000) * 3_600_000;
    const firstHour = latestHour - 23 * 3_600_000;
    const hourly = Array.from({ length: 24 }, (_, index) => {
      const values = hourlyValues.get(firstHour + index * 3_600_000);
      const average = (samples) => samples?.length
        ? Number((samples.reduce((sum, value) => sum + value, 0) / samples.length).toFixed(1))
        : null;
      const pm25 = average(values?.pm25);
      const pm10 = average(values?.pm10);
      const subIndices = [
        pollutantAqi("pm25", pm25),
        pollutantAqi("pm10", pm10),
      ].filter(Number.isFinite);
      return {
        time: formatLocalHour(firstHour + index * 3_600_000, timezone),
        aqi: subIndices.length ? Math.max(...subIndices) : null,
        pm25,
        pm10,
      };
    });
    const provider = location.provider?.name ? ` · ${location.provider.name}` : "";
    return {
      source: `OpenAQ · ${location.name}${provider}`,
      timezone,
      updatedAt,
      hourly,
    };
  }

  return null;
}

async function searchOpenStreetMap(query) {
  const request = nominatimQueue.then(async () => {
    const wait = Math.max(0, 1000 - (Date.now() - lastNominatimRequestAt));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    lastNominatimRequestAt = Date.now();

    const params = new URLSearchParams({
      q: query.replace(/\bgujrat\b/gi, "Gujarat").replace(/\s*,\s*/g, ", "),
      format: "jsonv2",
      addressdetails: "1",
      limit: "6",
    });
    const data = await fetchJson(`${OPEN_STREET_MAP_GEOCODING}?${params}`, {
      "User-Agent": "AERIS/1.0 (air-quality location search)",
      "Accept-Language": "en",
    });
    const region = data.find((location) =>
      location.osm_type === "relation" &&
      location.address?.state &&
      !location.address?.city &&
      !location.address?.town &&
      !location.address?.village,
    );
    if (region) {
      let cities = [];
      try {
        cities = await searchCitiesInRegion(region);
      } catch (error) {
        console.warn(`OpenStreetMap city lookup failed; returning region match: ${error.message}`);
      }
      if (cities.length) {
        return {
          source: "OpenStreetMap Nominatim + Overpass",
          results: [...cities, mapNominatimLocation(region)],
        };
      }
    }
    return {
      source: "OpenStreetMap Nominatim",
      results: data.map(mapNominatimLocation),
    };
  });
  nominatimQueue = request.then(() => undefined, () => undefined);
  return request;
}

function mapNominatimLocation(location) {
  const address = location.address || {};
  const name = address.city || address.town || address.village || address.municipality ||
    address.county || address.state || location.name || location.display_name.split(",")[0];
  const district = address.state_district || address.county || null;
  return {
    name,
    admin1: address.state || null,
    admin2: district && district.toLowerCase() !== name.toLowerCase() ? district : null,
    country: address.country || null,
    lat: Number(location.lat),
    lon: Number(location.lon),
    timezone: null,
  };
}

async function searchCitiesInRegion(region) {
  const relationId = Number(region.osm_id);
  if (!Number.isSafeInteger(relationId) || relationId <= 0) return [];
  const cacheKey = String(relationId);
  if (regionCityCache.has(cacheKey)) return regionCityCache.get(cacheKey);

  const areaId = 3_600_000_000 + relationId;
  const query = `[out:json][timeout:20];area(${areaId})->.region;(node["place"~"^(city|town)$"]["name"](area.region););out center;`;
  const response = await fetch(OPEN_STREET_MAP_OVERPASS, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "AERIS/1.0 (air-quality location search)",
    },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) {
    throw Object.assign(new Error(`OpenStreetMap city lookup returned ${response.status}`), { status: 502 });
  }
  const data = await response.json();
  const address = region.address || {};
  const cities = (data.elements || [])
    .filter((element) => element.tags?.name && Number.isFinite(Number(element.lat)) && Number.isFinite(Number(element.lon)))
    .sort((left, right) => Number(right.tags.population || 0) - Number(left.tags.population || 0))
    .slice(0, 20)
    .map((element) => ({
      name: element.tags.name,
      admin1: address.state || null,
      admin2: address.state_district || address.county || null,
      country: address.country || null,
      lat: Number(element.lat),
      lon: Number(element.lon),
      timezone: null,
    }));
  regionCityCache.set(cacheKey, cities);
  return cities;
}

function aqiCategory(aqi) {
  if (aqi == null) return { category: "Unavailable", color: "gray" };
  if (aqi <= 50) return { category: "Good", color: "green" };
  if (aqi <= 100) return { category: "Moderate", color: "yellow" };
  if (aqi <= 150) return { category: "Poor", color: "orange" };
  if (aqi <= 200) return { category: "Very Poor", color: "red" };
  return { category: "Severe", color: "purple" };
}

async function current(lat, lon) {
  const token = waqiToken();
  if (token) {
    const data = await fetchWaqi(`feed/geo:${lat};${lon}/`, token);
    const aqi = data.aqi == null || data.aqi === "-" ? null : Number(data.aqi);
    const pollutantKeys = { pm25: "pm25", pm10: "pm10", no2: "no2", o3: "o3", co: "co", so2: "so2" };
    const pollutants = Object.fromEntries(Object.entries(pollutantKeys).map(([key, sourceKey]) => {
      const value = Number(data.iaqi?.[sourceKey]?.v);
      return [key, Number.isFinite(value) ? { value, unit: "AQI sub-index" } : null];
    }));
    const attribution = (data.attributions || []).map((item) => item.name).filter(Boolean).join(" · ");
    return {
      location: { lat: Number(lat), lon: Number(lon) },
      source: `World Air Quality Index (WAQI)${data.city?.name ? ` · ${data.city.name}` : ""}${attribution ? ` · ${attribution}` : ""}`,
      isLive: aqi != null && Number.isFinite(aqi),
      updatedAt: data.time?.iso || data.time?.s || null,
      aqi: Number.isFinite(aqi) ? aqi : null,
      ...aqiCategory(Number.isFinite(aqi) ? aqi : null),
      pollutants,
    };
  }
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = currentLocationCache.get(cacheKey);
  if (cached?.complete && Date.now() - cached.createdAt < 10 * 60 * 1000) {
    return {
      ...cached.value,
      isLive: false,
      source: `${cached.value.source} · cached reading`,
    };
  }
  const params = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    current: "us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide",
    timezone: "auto",
  });
  let data;
  try {
    data = await fetchJson(`${OPEN_METEO_AQ}?${params}`);
  } catch (error) {
    if (cached) return { ...cached.value, isLive: false, source: `${cached.value.source} · cached fallback` };
    throw error;
  }
  const c = data.current || {};
  const usAqi = c.us_aqi ?? null;
  const value = {
    location: { lat: Number(lat), lon: Number(lon) },
    source: "Open-Meteo Air Quality",
    isLive: usAqi != null,
    updatedAt: c.time || null,
    aqi: usAqi,
    ...aqiCategory(usAqi),
    pollutants: {
      pm25: c.pm2_5 == null ? null : { value: c.pm2_5, unit: "µg/m³" },
      pm10: c.pm10 == null ? null : { value: c.pm10, unit: "µg/m³" },
      no2: c.nitrogen_dioxide == null ? null : { value: c.nitrogen_dioxide, unit: "µg/m³" },
      o3: c.ozone == null ? null : { value: c.ozone, unit: "µg/m³" },
      co: c.carbon_monoxide == null ? null : { value: c.carbon_monoxide, unit: "µg/m³" },
      so2: c.sulphur_dioxide == null ? null : { value: c.sulphur_dioxide, unit: "µg/m³" },
    },
  };
  currentLocationCache.set(cacheKey, { createdAt: Date.now(), complete: true, value });
  return value;
}

async function mapLocations(bounds = null) {
  const token = waqiToken();
  if (token) {
    const params = {
      latlng: bounds
        ? `${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon}`
        : "-85,-180,85,180",
    };
    const stations = await fetchWaqi("map/bounds/", token, params);
    if (!Array.isArray(stations)) {
      throw Object.assign(new Error("WAQI returned an invalid station list"), { status: 502, provider: "WAQI" });
    }
    const points = stations.flatMap((station) => {
      const lat = Number(station.lat), lon = Number(station.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
      const aqi = station.aqi == null || station.aqi === "-" ? null : Number(station.aqi);
      const value = Number.isFinite(aqi) ? aqi : null;
      return [{
        name: station.station?.name || "Air quality station",
        country: "",
        lat,
        lon,
        aqi: value,
        updatedAt: station.time?.iso || null,
        ...aqiCategory(value),
      }];
    });
    return {
      source: "World Air Quality Index (WAQI) · live monitoring stations",
      dailyLimit: false,
      points,
    };
  }
  let locations = MAP_LOCATIONS;
  if (bounds) {
    const minLat = Number(bounds.minLat), maxLat = Number(bounds.maxLat);
    const minLon = Number(bounds.minLon), maxLon = Number(bounds.maxLon);
    if ([minLat, maxLat, minLon, maxLon].every(Number.isFinite)) {
      locations = MAP_LOCATIONS.filter((city) => {
        const lat = Number(city.lat), lon = Number(city.lon);
        return Number.isFinite(lat) && Number.isFinite(lon) &&
          lat >= minLat && lat <= maxLat &&
          lon >= minLon && lon <= maxLon;
      }).slice(0, 3000);
    }
  }
  if (!locations.length) return { source: "Open-Meteo Air Quality · model-grid estimates", points: [] };
  const cacheKey = bounds ? `${bounds.minLat},${bounds.maxLat},${bounds.minLon},${bounds.maxLon}` : "world";
  const cached = mapLocationCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < (cached.ttlMs || 5 * 60 * 1000)) return cached.value;
  const pending = (async () => {
    const points = [];
    let providerLimited = false;
    let dailyQuotaExceeded = false;
    for (let start = 0; start < locations.length; start += 100) {
      const batch = locations.slice(start, start + 100);
      if (providerLimited) {
        points.push(...batch.map((location) => ({ ...location, aqi: null, updatedAt: null, ...aqiCategory(null) })));
        continue;
      }
      const params = new URLSearchParams({
        latitude: batch.map((location) => location.lat).join(","),
        longitude: batch.map((location) => location.lon).join(","),
        current: "us_aqi",
        timezone: "auto",
      });
      let response;
      try {
        response = await fetchJson(`${OPEN_METEO_AQ}?${params}`);
      } catch (error) {
        if (error.status === 429) {
          providerLimited = true;
          dailyQuotaExceeded = error.dailyLimit === true;
          response = batch.map(() => ({ current: {} }));
        }
        else throw error;
      }
      const readings = Array.isArray(response) ? response : [response];
      for (let index = 0; index < batch.length; index++) {
        const location = batch[index];
        const currentReading = readings[index]?.current || {};
        const aqi = currentReading.us_aqi ?? null;
        points.push({ ...location, aqi, updatedAt: currentReading.time || null, ...aqiCategory(aqi) });
        if (aqi != null) {
          const category = aqiCategory(aqi);
          currentLocationCache.set(`${Number(location.lat).toFixed(3)},${Number(location.lon).toFixed(3)}`, {
            createdAt: Date.now(),
            complete: false,
            value: {
              location: { lat: Number(location.lat), lon: Number(location.lon) },
              source: "Open-Meteo Air Quality",
              isLive: true,
              updatedAt: currentReading.time || null,
              aqi,
              ...category,
              pollutants: { pm25: null, pm10: null, no2: null, o3: null, co: null, so2: null },
            },
          });
        }
      }
    }
    const hasReadings = points.some((point) => point.aqi != null);
    return {
      source: providerLimited && !hasReadings
        ? dailyQuotaExceeded
          ? "Open-Meteo Air Quality · daily request limit exceeded · readings unavailable"
          : "Open-Meteo Air Quality · provider rate-limited · readings unavailable"
        : "Open-Meteo Air Quality · live city readings",
      dailyLimit: dailyQuotaExceeded,
      points,
      hasReadings,
    };
  })();
  mapLocationCache.set(cacheKey, { createdAt: Date.now(), ttlMs: 30 * 60 * 1000, value: pending });
  try {
    const result = await pending;
    const { hasReadings, ...value } = result;
    mapLocationCache.set(cacheKey, {
      createdAt: Date.now(),
      ttlMs: hasReadings ? 30 * 60 * 1000 : 60 * 1000,
      value,
    });
    return value;
  } catch (error) {
    if (mapLocationCache.get(cacheKey)?.value === pending) mapLocationCache.delete(cacheKey);
    throw error;
  }
}

async function forecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    hourly: "us_aqi,pm2_5",
    forecast_days: "3",
    timezone: "auto",
  });
  const data = await fetchJson(`${OPEN_METEO_AQ}?${params}`);
  return { source: "Open-Meteo Air Quality", updatedAt: data.current?.time || null, hourly: data.hourly || {} };
}

async function history(lat, lon) {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = historyLocationCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 30 * 60 * 1000) {
    return { ...cached.value, source: `${cached.value.source} · cached history` };
  }
  const openAqKey = process.env.OPENAQ_API_KEY?.trim();
  if (openAqKey) {
    try {
      const openAqValue = await openAqHistory(lat, lon, openAqKey);
      if (openAqValue) {
        historyLocationCache.set(cacheKey, { createdAt: Date.now(), value: openAqValue });
        return openAqValue;
      }
    } catch (error) {
      if (cached) return { ...cached.value, source: `${cached.value.source} · cached fallback` };
      throw error;
    }
  }
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "us_aqi",
    hourly: "us_aqi,pm2_5,pm10",
    past_days: "1",
    forecast_days: "1",
    timezone: "auto",
  });
  try {
    const data = await fetchJson(`${OPEN_METEO_AQ}?${params}`);
    const hourly = data.hourly || {};
    const times = hourly.time || [];
    const value = {
      source: "Open-Meteo Air Quality",
      timezone: data.timezone || null,
      updatedAt: data.current?.time || null,
      hourly: times.map((time, index) => ({
        time,
        aqi: hourly.us_aqi?.[index] ?? null,
        pm25: hourly.pm2_5?.[index] ?? null,
        pm10: hourly.pm10?.[index] ?? null,
      })),
    };
    historyLocationCache.set(cacheKey, { createdAt: Date.now(), value });
    return value;
  } catch (error) {
    if (cached) return { ...cached.value, source: `${cached.value.source} · cached fallback` };
    throw error;
  }
}

async function weather(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    timezone: "auto",
  });
  const data = await fetchJson(`${OPEN_METEO_WEATHER}?${params}`);
  return { source: "Open-Meteo Weather", current: data.current || null, location: { lat: Number(lat), lon: Number(lon) } };
}

async function searchLocations(query) {
  let openStreetMapError = null;
  try {
    const result = await searchOpenStreetMap(query);
    if (result.results.length) return result;
  } catch (error) {
    openStreetMapError = error;
  }

  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "en",
    format: "json",
  });
  const data = await fetchJson(`${OPEN_METEO_GEOCODING}?${params}`);
  const results = (data.results || []).map((location) => ({
    name: location.name,
    admin1: location.admin1 || null,
    admin2: location.admin2 || null,
    country: location.country || null,
    lat: location.latitude,
    lon: location.longitude,
    timezone: location.timezone || null,
  }));
  if (results.length) return { source: "Open-Meteo Geocoding", results };
  if (openStreetMapError) throw openStreetMapError;
  return { source: "OpenStreetMap Nominatim + Open-Meteo Geocoding", results: [] };
}

module.exports = { current, forecast, history, mapLocations, weather, searchLocations };
