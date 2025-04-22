/**
 * GeoJSON Feature representing a geographic forecast area
 */
interface Feature {
  /** Unique identifier for the geographic feature */
  id: string;
  /** GeoJSON type specification, always "Feature" */
  type: "Feature";
  /** Bounding box in format [minLongitude, minLatitude, maxLongitude, maxLatitude] */
  bbox: [number, number, number, number];
  /** Geometry specification for the area */
  geometry: {
    /** Type of geometry, always MultiPolygon for forecast areas */
    type: "MultiPolygon";
    /** Nested array structure: [polygons][rings][points][coordinates] */
    coordinates: number[][][][];
  };
  /** Additional properties of the feature */
  properties: {
    /** Center point coordinates [longitude, latitude] */
    centroid: number[];
    /** Area identifier matching areaId in forecasts */
    id: string;
  };
}

/**
 * GeoJSON FeatureCollection containing multiple forecast areas
 */
interface FeatureCollection {
  /** Array of individual geographic features */
  features: Feature[];
  /** GeoJSON type specification, always "FeatureCollection" */
  type: "FeatureCollection";
}

interface Image {
  id: string;
  url: string;
  width: number;
  height: number;
  credit?: string;
  caption: string;
  tag: string;
  altText?: string;
  dateTaken?: string | null;
  isArchived: boolean;
}

interface Media {
  Images: Image[];
}

interface Communications {
  headline: string;
  sms: string;
}

interface RegionalDiscussion {
  id: string;
  title: string;
  publicName: string;
  type: "regionaldiscussion";
  polygons: string;
  areaId: string;
  forecaster: string;
  issueDateTime: string;
  expiryDateTime: string;
  isTranslated: boolean;
  message: string;
  communications: Communications;
  media: Media;
}

interface AvalancheProblem {
  type: string;
  aspectElevations: string;
  likelihood: string;
  expectedSize: { min: string; max: string };
  comment: string;
}

interface DangerRating {
  position: number;
  alp: string;
  tln: string;
  btl: string;
  date: string;
}

interface AvalancheForecast {
  id: string;
  publicName: string;
  type: "avalancheforecast";
  polygons: string;
  areaId: string;
  forecaster: string;
  issueDateTime: string;
  expiryDateTime: string;
  isTranslated: boolean;
  weatherSummary: { days: any[] };
  snowpackSummary: { days: any[] };
  avalancheSummary: { days: { date: string; content: string }[] };
  terrainAndTravelAdvice: { days: any[] };
  communication: Communications;
  media: Media;
  dangerRatings: { days: DangerRating[] };
  avalancheProblems: { days: AvalancheProblem[] };
}

interface SpecialProduct {
  id: string;
  title: string;
  publicName: string;
  type: "specialproduct";
  polygons: string;
  areaId: string;
  forecaster: string;
  issueDateTime: string;
  expiryDateTime: string;
  isTranslated: boolean;
  specialProductType: "warning" | "specialAdvisory";
  startDate?: string;
  message?: string;
  communications: Communications;
  media: Media;
}

type ApiResponse = (RegionalDiscussion | AvalancheForecast | SpecialProduct)[];

export class CaicClient {
  private baseUrl = "https://avalanche.state.co.us/api-proxy/avid";

  private async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);
    if (params) {
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key]),
      );
    }

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${url.toString()}:`, error);
      throw error;
    }
  }

  async getAllProducts(includeExpired: boolean = true): Promise<ApiResponse> {
    const params = {
      _api_proxy_uri: `/products/all?includeExpired=${includeExpired}`,
    };
    return this.get<ApiResponse>("", params);
  }

  async getProductsByArea(
    productType: "avalancheforecast" | "regionaldiscussion" | "specialproduct",
    includeExpired: boolean = true,
  ): Promise<FeatureCollection> {
    const params = {
      _api_proxy_uri: `/products/all/area?productType=${productType}&includeExpired=${includeExpired}`,
    };
    return this.get<FeatureCollection>("", params);
  }

  async getAvalancheForecasts(): Promise<FeatureCollection> {
    return this.getProductsByArea("avalancheforecast");
  }

  async getRegionalDiscussions(): Promise<FeatureCollection> {
    return this.getProductsByArea("regionaldiscussion");
  }

  async getSpecialProducts(): Promise<FeatureCollection> {
    return this.getProductsByArea("specialproduct");
  }

  async getAllData(includeExpired: boolean = true): Promise<ApiResponse> {
    return this.getAllProducts(includeExpired);
  }

  async load() {
    const forecast = this.getAllData();
    const forecastFeatures = this.getAvalancheForecasts();
    const regionalFeatures = this.getRegionalDiscussions();
    const specialProductsFeatures = this.getSpecialProducts();

    return await Promise.all([
      forecast,
      forecastFeatures,
      regionalFeatures,
      specialProductsFeatures,
    ]);
  }
}

/**
 * Geographic coordinate point used for location querying
 */
export interface Coordinate {
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lng: number;
}

/**
 * Rectangular geographic area defined by latitude/longitude boundaries
 * Used for efficient first-pass filtering of point-in-polygon checks
 */
interface BoundingBox {
  /** Minimum latitude (southern boundary) */
  minLat: number;
  /** Maximum latitude (northern boundary) */
  maxLat: number;
  /** Minimum longitude (western boundary) */
  minLng: number;
  /** Maximum longitude (eastern boundary) */
  maxLng: number;
}

// Helper function to check if point is in bounding box
function isPointInBbox(point: Coordinate, bbox: BoundingBox): boolean {
  return (
    point.lat >= bbox.minLat &&
    point.lat <= bbox.maxLat &&
    point.lng >= bbox.minLng &&
    point.lng <= bbox.maxLng
  );
}

// Ray casting algorithm to determine if point is in polygon
function isPointInPolygon(
  point: Coordinate,
  polygon: [number, number][],
): boolean {
  if (!Array.isArray(polygon) || polygon.length === 0) {
    return false;
  }

  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const currentPoint = polygon[i];
    const previousPoint = polygon[j];

    if (
      !Array.isArray(currentPoint) ||
      !Array.isArray(previousPoint) ||
      currentPoint.length < 2 ||
      previousPoint.length < 2
    ) {
      continue;
    }

    const xi = currentPoint[0];
    const yi = currentPoint[1];
    const xj = previousPoint[0];
    const yj = previousPoint[1];

    if (
      typeof xi !== "number" ||
      typeof yi !== "number" ||
      typeof xj !== "number" ||
      typeof yj !== "number"
    ) {
      continue;
    }

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// Main function to find polygon containing point
function findPolygonForCoordinates(
  point: Coordinate,
  geojson: FeatureCollection,
): string | null {
  // Validate input
  if (!geojson?.features || !Array.isArray(geojson.features)) {
    throw new Error("Invalid GeoJSON input");
  }

  for (const feature of geojson.features) {
    if (!feature.bbox || feature.bbox.length !== 4) {
      continue;
    }

    // First check bounding box for quick rejection
    const [minLng, minLat, maxLng, maxLat] = feature.bbox;
    const bbox: BoundingBox = {
      minLat,
      maxLat,
      minLng,
      maxLng,
    };

    if (!isPointInBbox(point, bbox)) {
      continue;
    }

    // Check if geometry and coordinates exist
    if (
      !feature.geometry?.coordinates ||
      !Array.isArray(feature.geometry.coordinates)
    ) {
      continue;
    }

    // Check each polygon in the multipolygon
    for (const polygon of feature.geometry.coordinates) {
      if (!Array.isArray(polygon)) continue;

      // Check each ring of the polygon
      for (const ring of polygon) {
        if (!Array.isArray(ring)) continue;

        // Ensure ring is an array of [number, number] coordinates
        const validRing = ring as [number, number][];
        if (isPointInPolygon(point, validRing)) {
          return feature.id;
        }
      }
    }
  }

  return null;
}

async function find(point: Coordinate, client: CaicClient) {
  const data = await client.load();
  const [forecast, ...features] = data;

  const result = [];

  for (const feature of features) {
    const id = findPolygonForCoordinates(point, feature);
    if (id) {
      const report = forecast.find((v) => v.areaId === id);
      if (report) {
        result.push(report);
      }
    }
  }
  return result;
}

function summarizeAvalancheForecast(forecast: AvalancheForecast): string {
  let summary = "";
  if (forecast.avalancheSummary && forecast.avalancheSummary.days) {
    // Check if avalancheSummary and days exist
    for (const day of forecast.avalancheSummary.days) {
      summary += `${day.date}: ${day.content}\n`;
    }
  } else {
    summary = "No avalanche summary available."; // Or handle the case where it's missing as needed
  }
  return summary.trim();
}

export async function fetchAvalancheSummary(
  point: Coordinate,
  client: CaicClient,
) {
  const results = await find(point, client);

  let avalancheSummary = "";

  for (const result of results) {
    switch (result.type) {
      case "regionaldiscussion":
        avalancheSummary += "Regional Discussion: \n" + result.message + " \n ";
        break;
      case "avalancheforecast":
        avalancheSummary +=
          "Avalanche forecast: \n" + summarizeAvalancheForecast(result) + "\n";
        break;
    }
  }

  if (avalancheSummary.length === 0) {
    avalancheSummary += `No summary found for lat:${point.lat} long: ${point.lng}`;
  }

  return avalancheSummary.trim();
}
