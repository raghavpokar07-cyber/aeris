process.env.JWT_SECRET = "test-secret";
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const app = require("../src/app");
const air = require("../src/services/airQuality");
const User = require("../src/models/User");

test("Google sign-in config reports whether a public client ID is configured", async () => {
  const previousClientId = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;

  try {
    const response = await request(app).get("/api/auth/google/config");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ enabled: false, clientId: null });
  } finally {
    if (previousClientId == null) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previousClientId;
  }
});

test("Google sign-in rejects credentials until a client ID is configured", async () => {
  const previousClientId = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;

  try {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "signed-google-id-token" });
    expect(response.status).toBe(503);
    expect(response.body.error).toBe("Google sign-in is not configured");
  } finally {
    if (previousClientId == null) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previousClientId;
  }
});

test("Google sign-in creates an account only from a verified Google identity token", async () => {
  const previousClientId = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
  const verifier = jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
    getPayload: () => ({
      sub: "google-user-123",
      email: "new.user@example.com",
      email_verified: true,
      name: "New User",
    }),
  });
  const findUser = jest.spyOn(User, "findOne").mockResolvedValueOnce(null).mockResolvedValueOnce(null);
  const newUser = { id: "000000000000000000000002", name: "New User", email: "new.user@example.com" };
  const createUser = jest.spyOn(User, "create").mockResolvedValue(newUser);

  try {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "signed-google-id-token" });
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
    expect(jwt.verify(response.body.token, process.env.JWT_SECRET).sub).toBe(newUser.id);
    expect(verifier).toHaveBeenCalledWith({
      idToken: "signed-google-id-token",
      audience: "test-google-client-id",
    });
    expect(findUser).toHaveBeenCalledTimes(2);
    expect(createUser).toHaveBeenCalledWith({
      name: "New User",
      email: "new.user@example.com",
      googleId: "google-user-123",
    });
  } finally {
    verifier.mockRestore();
    findUser.mockRestore();
    createUser.mockRestore();
    if (previousClientId == null) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previousClientId;
  }
});

test("Google sign-in rejects accounts whose Google email is not verified", async () => {
  const previousClientId = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
  const verifier = jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
    getPayload: () => ({
      sub: "google-user-unverified",
      email: "unverified@example.com",
      email_verified: false,
    }),
  });
  const findUser = jest.spyOn(User, "findOne");

  try {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "signed-google-id-token" });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("A verified Google account is required");
    expect(findUser).not.toHaveBeenCalled();
  } finally {
    verifier.mockRestore();
    findUser.mockRestore();
    if (previousClientId == null) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previousClientId;
  }
});

test("Google sign-in links an existing account with the same verified email", async () => {
  const previousClientId = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
  const verifier = jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
    getPayload: () => ({
      sub: "google-user-456",
      email: "existing.user@example.com",
      email_verified: true,
      name: "Existing User",
    }),
  });
  const existingUser = {
    id: "000000000000000000000003",
    name: "Existing User",
    email: "existing.user@example.com",
    save: jest.fn().mockResolvedValue(undefined),
  };
  const findUser = jest.spyOn(User, "findOne").mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);
  const createUser = jest.spyOn(User, "create");

  try {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "signed-google-id-token" });
    expect(response.status).toBe(200);
    expect(existingUser.googleId).toBe("google-user-456");
    expect(existingUser.save).toHaveBeenCalledTimes(1);
    expect(createUser).not.toHaveBeenCalled();
  } finally {
    verifier.mockRestore();
    findUser.mockRestore();
    createUser.mockRestore();
    if (previousClientId == null) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previousClientId;
  }
});

test("health endpoint returns service status", async () => {
  const response = await request(app).get("/api/health");
  expect(response.status).toBe(200);
  expect(response.body.service).toBe("AERIS");
});

test("protected route rejects missing token", async () => {
  const response = await request(app).get("/api/profile");
  expect(response.status).toBe(401);
});

test("validation errors return a safe message without exposing schema details", async () => {
  const response = await request(app).post("/api/auth/login").send({});
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Please check the request fields and try again.");
  expect(JSON.stringify(response.body)).not.toContain("ZodError");
});

test("location search rejects queries that are too short", async () => {
  const response = await request(app).get("/api/air-quality/search-location?q=a");
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Please check the request fields and try again.");
});

test("location search expands a misspelled district query to its cities and full region context", async () => {
  const fetch = jest.spyOn(global, "fetch")
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        name: "Kutch",
        lat: "23.583333",
        lon: "70",
        osm_type: "relation",
        osm_id: 123,
        address: { county: "Kutch", state: "Gujarat", country: "India" },
      }],
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elements: [
          { lat: 23.2472, lon: 69.6683, tags: { name: "Bhuj", population: "213000", place: "city" } },
          { lat: 23.0753, lon: 70.1337, tags: { name: "Gandhidham", population: "247000", place: "city" } },
        ],
      }),
    });

  try {
    const result = await air.searchLocations("kutch,gujrat");
    expect(result.source).toBe("OpenStreetMap Nominatim + Overpass");
    expect(result.results[0]).toMatchObject({
      name: "Gandhidham",
      admin1: "Gujarat",
      admin2: "Kutch",
      country: "India",
      lat: 23.0753,
      lon: 70.1337,
    });
    expect(result.results[1].name).toBe("Bhuj");
    expect(result.results.at(-1)).toMatchObject({ name: "Kutch", admin1: "Gujarat", country: "India" });
    expect(fetch.mock.calls[0][0]).toContain("kutch%2C+Gujarat");
    expect(fetch.mock.calls[0][1].headers["User-Agent"]).toContain("AERIS");
    expect(fetch.mock.calls[1][1].method).toBe("POST");
  } finally {
    fetch.mockRestore();
  }
});

test("location search returns the region when the OpenStreetMap city lookup is unavailable", async () => {
  const fetch = jest.spyOn(global, "fetch")
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        name: "Rajasthan",
        lat: "26",
        lon: "73",
        osm_type: "relation",
        osm_id: 987654,
        address: { state: "Rajasthan", country: "India" },
      }],
    })
    .mockResolvedValueOnce({ ok: false, status: 502 });

  try {
    const result = await air.searchLocations("Rajasthan, India");
    expect(result.source).toBe("OpenStreetMap Nominatim");
    expect(result.results).toContainEqual(expect.objectContaining({
      name: "Rajasthan",
      admin1: "Rajasthan",
      country: "India",
      lat: 26,
      lon: 73,
    }));
  } finally {
    fetch.mockRestore();
  }
});

test("live map returns model-grid AQI values with explicit locations", async () => {
  const fetch = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => Array.from({ length: 3000 }, (_, index) => ({
      current: { us_aqi: index === 0 ? 42 : null, time: "2026-01-01T12:00" },
    })),
  });

  try {
    const response = await request(app).get("/api/air-quality/map");
    expect(response.status).toBe(200);
    expect(response.body.source).toContain("live city readings");
    expect(response.body.points).toHaveLength(3000);
    expect(response.body.points[0]).toMatchObject({
      name: "New Delhi",
      country: "India",
      aqi: 42,
      category: "Good",
    });
    expect(response.body.points[1].aqi).toBeNull();
  } finally {
    fetch.mockRestore();
  }
});

test("identical map requests share an in-flight provider fetch", async () => {
  const fetch = jest.spyOn(global, "fetch").mockImplementation(() => new Promise((resolve) => {
    setTimeout(() => resolve({
      ok: true,
      json: async () => ({ current: { us_aqi: 42, time: "2026-01-01T12:00" } }),
    }), 20);
  }));
  const bounds = { minLat: 28, maxLat: 29, minLon: 77, maxLon: 78 };

  try {
    const [first, second] = await Promise.all([
      air.mapLocations(bounds),
      air.mapLocations(bounds),
    ]);
    expect(first.points.length).toBeGreaterThan(0);
    expect(second.points).toEqual(first.points);
    expect(fetch).toHaveBeenCalledTimes(Math.ceil(first.points.length / 100));
  } finally {
    fetch.mockRestore();
  }
});

test("WAQI token enables live station readings for current AQI and map", async () => {
  const previousToken = process.env.WAQI_API_TOKEN;
  process.env.WAQI_API_TOKEN = "test-token";
  const fetch = jest.spyOn(global, "fetch").mockImplementation(async (url) => {
    if (String(url).includes("/feed/geo:")) {
      return {
        ok: true,
        json: async () => ({
          status: "ok",
          data: {
            aqi: "61",
            city: { name: "Mumbai", geo: [19.076, 72.8777] },
            time: { iso: "2026-01-01T12:00:00+05:30" },
            iaqi: { pm25: { v: 61 } },
            attributions: [{ name: "World Air Quality Index Project" }],
          },
        }),
      };
    }
    return {
      ok: true,
      json: async () => ({
        status: "ok",
        data: [{ aqi: "61", lat: 19.076, lon: 72.8777, station: { name: "Mumbai station" } }],
      }),
    };
  });

  try {
    const reading = await air.current(19.076, 72.8777);
    const map = await air.mapLocations({ minLat: 18, maxLat: 20, minLon: 72, maxLon: 74 });
    expect(reading).toMatchObject({
      aqi: 61,
      isLive: true,
      source: expect.stringContaining("World Air Quality Index (WAQI)"),
      pollutants: { pm25: { value: 61, unit: "AQI sub-index" } },
    });
    expect(map.source).toContain("live monitoring stations");
    expect(map.points[0]).toMatchObject({ name: "Mumbai station", aqi: 61, category: "Moderate" });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(String(fetch.mock.calls[0][0])).toContain("token=test-token");
    expect(new URL(String(fetch.mock.calls[1][0])).searchParams.get("latlng")).toBe("18,72,20,74");
  } finally {
    fetch.mockRestore();
    if (previousToken == null) delete process.env.WAQI_API_TOKEN;
    else process.env.WAQI_API_TOKEN = previousToken;
  }
});

test("current AQI is reused briefly instead of spending another provider request", async () => {
  const fetch = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      current: { us_aqi: 38, pm2_5: 7.2, pm10: 12.1, time: "2026-01-01T12:00" },
    }),
  });

  try {
    const first = await air.current(20.123, 80.234);
    const second = await air.current(20.123, 80.234);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(first).toMatchObject({ aqi: 38, isLive: true });
    expect(second).toMatchObject({ aqi: 38, isLive: false });
    expect(second.source).toContain("cached reading");
  } finally {
    fetch.mockRestore();
  }
});

test("hourly AQI history is cached for repeated chart loads", async () => {
  const previousKey = process.env.OPENAQ_API_KEY;
  delete process.env.OPENAQ_API_KEY;
  const fetch = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      timezone: "Asia/Kolkata",
      current: { us_aqi: 51, time: "2026-01-01T12:00" },
      hourly: { time: ["2026-01-01T11:00", "2026-01-01T12:00"], us_aqi: [48, 51], pm2_5: [8, 9], pm10: [14, 15] },
    }),
  });

  try {
    const first = await air.history(20.432, 80.543);
    const second = await air.history(20.432, 80.543);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second.source).toContain("cached history");
    expect(second.hourly).toEqual(first.hourly);
  } finally {
    fetch.mockRestore();
    if (previousKey == null) delete process.env.OPENAQ_API_KEY;
    else process.env.OPENAQ_API_KEY = previousKey;
  }
});

test("hourly AQI history aggregates fresh OpenAQ PM readings into hourly US AQI", async () => {
  const previousKey = process.env.OPENAQ_API_KEY;
  process.env.OPENAQ_API_KEY = "test-openaq-key";
  const now = Date.now();
  const recentReadingStart = new Date(now - 90 * 60 * 1000);
  recentReadingStart.setUTCMinutes(0, 0, 0);
  const nextReadingStart = new Date(recentReadingStart.getTime() + 15 * 60 * 1000);
  const recentEnd = new Date(recentReadingStart.getTime() + 15 * 60 * 1000);
  const nextEnd = new Date(nextReadingStart.getTime() + 15 * 60 * 1000);
  const toReading = (value, start, end) => ({
    value,
    period: {
      datetimeFrom: { utc: start.toISOString(), local: start.toISOString() },
      datetimeTo: { utc: end.toISOString(), local: end.toISOString() },
    },
  });
  const locationLast = new Date(now - 15 * 60 * 1000).toISOString();
  const fetch = jest.spyOn(global, "fetch").mockImplementation(async (url, options) => {
    expect(options.headers["X-API-Key"]).toBe("test-openaq-key");
    const parsedUrl = new URL(String(url));
    if (parsedUrl.pathname === "/v3/locations") {
      return {
        ok: true,
        json: async () => ({
          results: [{
            id: 501,
            name: "Test monitoring station",
            timezone: "UTC",
            distance: 1000,
            datetimeLast: { utc: locationLast },
            sensors: [
              { id: 601, parameter: { name: "pm25", units: "µg/m³" } },
              { id: 602, parameter: { name: "pm10", units: "µg/m³" } },
            ],
          }],
        }),
      };
    }
    if (parsedUrl.pathname === "/v3/sensors/601") {
      return {
        ok: true,
        json: async () => ({
          results: [{
            id: 601,
            parameter: { name: "pm25", units: "µg/m³" },
            datetimeLast: { utc: locationLast },
          }],
        }),
      };
    }
    if (parsedUrl.pathname === "/v3/sensors/602") {
      return {
        ok: true,
        json: async () => ({
          results: [{
            id: 602,
            parameter: { name: "pm10", units: "µg/m³" },
            datetimeLast: { utc: locationLast },
          }],
        }),
      };
    }
    if (parsedUrl.pathname === "/v3/sensors/601/measurements") {
      return {
        ok: true,
        json: async () => ({
          results: [toReading(34.8, recentReadingStart, recentEnd), toReading(36, nextReadingStart, nextEnd)],
        }),
      };
    }
    if (parsedUrl.pathname === "/v3/sensors/602/measurements") {
      return {
        ok: true,
        json: async () => ({
          results: [toReading(56, recentReadingStart, recentEnd), toReading(56, nextReadingStart, nextEnd)],
        }),
      };
    }
    throw new Error(`Unexpected OpenAQ URL: ${parsedUrl.pathname}`);
  });

  try {
    const result = await air.history(28.6139, 77.209);
    const populatedHour = result.hourly.find((hour) => hour.pm25 != null);
    expect(result.source).toContain("OpenAQ · Test monitoring station");
    expect(result.timezone).toBe("UTC");
    expect(result.hourly).toHaveLength(24);
    expect(populatedHour).toMatchObject({ pm25: 35.4, pm10: 56, aqi: 100 });
    expect(fetch).toHaveBeenCalledTimes(5);
  } finally {
    fetch.mockRestore();
    if (previousKey == null) delete process.env.OPENAQ_API_KEY;
    else process.env.OPENAQ_API_KEY = previousKey;
  }
});

test("map readings remain available as a cached current fallback after provider throttling", async () => {
  const fetch = jest.spyOn(global, "fetch")
    .mockResolvedValueOnce({
      ok: true,
      json: async () => Array.from({ length: 100 }, (_, index) => ({
        current: { us_aqi: index < 2 ? 42 + index : null, time: "2026-01-01T12:00" },
      })),
    })
    .mockResolvedValueOnce({ ok: false, status: 429 });

  try {
    await air.mapLocations({
      minLat: -90.2,
      maxLat: 90.2,
      minLon: -180.2,
      maxLon: 180.2,
    });
    const reading = await air.current(19.076, 72.8777);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(reading).toMatchObject({
      aqi: 43,
      isLive: false,
      source: expect.stringContaining("cached fallback"),
    });
  } finally {
    fetch.mockRestore();
  }
});

test("map stops provider requests after rate limiting and keeps locations clickable", async () => {
  const now = Date.now();
  jest.spyOn(Date, "now").mockReturnValue(now + 61_000);
  const fetch = jest.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 429 });

  try {
    const result = await air.mapLocations({
      minLat: -90.1,
      maxLat: 90.1,
      minLon: -180.1,
      maxLon: 180.1,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.source).toContain("provider rate-limited");
    expect(result.points.length).toBeGreaterThan(100);
    expect(result.points.every((point) => point.aqi == null)).toBe(true);
    await expect(air.current(12, 45)).rejects.toMatchObject({ status: 429 });
    expect(fetch).toHaveBeenCalledTimes(1);
  } finally {
    fetch.mockRestore();
    jest.restoreAllMocks();
  }
});

test("daily AQI quota response is surfaced and not retried until the next UTC day", async () => {
  const now = Date.now();
  jest.spyOn(Date, "now").mockReturnValue(now + 130_000);
  const fetch = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: false,
    status: 429,
    headers: { get: () => null },
    json: async () => ({ reason: "Daily API request limit exceeded. Please try again tomorrow." }),
  });

  try {
    await expect(air.current(12.345, 45.678)).rejects.toMatchObject({
      status: 429,
      dailyLimit: true,
      message: "Daily API request limit exceeded. Please try again tomorrow.",
    });
    await expect(air.current(12.346, 45.679)).rejects.toMatchObject({ status: 429, dailyLimit: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  } finally {
    fetch.mockRestore();
    jest.restoreAllMocks();
  }
});

test("hourly AQI history validates coordinates before querying its provider", async () => {
  const response = await request(app).get("/api/air-quality/history?lat=91&lon=0");
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Please check the request fields and try again.");
});

test("daily indoor progress accepts only known checklist actions", async () => {
  const token = jwt.sign({ sub: "000000000000000000000001" }, process.env.JWT_SECRET);
  const response = await request(app)
    .patch("/api/plans/today/indoor-actions")
    .set("Authorization", `Bearer ${token}`)
    .send({ completedActions: ["Made-up action"] });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe("Please check the request fields and try again.");
});
