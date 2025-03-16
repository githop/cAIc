// Base Types
interface BaseEntity {
  id: string;
  type: string;
}

interface BackcountryZone extends BaseEntity {
  parent_id: string;
  slug: string;
  title: string;
  category: string;
  category_order: number;
  is_root: boolean;
  is_leaf: boolean;
  tree_level: number;
  parent_url: string;
  created_at: string;
  updated_at: string;
  url: string;
  geojson_url: string;
}

interface AvalancheDetail extends BaseEntity {
  description: string;
  classic_id: string | null;
}

interface WeatherDetail extends BaseEntity {
  description: string;
  classic_id: string | null;
}

interface SnowpackDetail extends BaseEntity {
  description: string;
  classic_id: string | null;
}

interface User extends BaseEntity {}

interface RelatedReportLinks {
  canonical_report: string;
  external_canonical_report: string;
  observation_report: string;
}

interface PublicReportDetail extends BaseEntity {
  is_public: boolean;
  weather_summary: string;
  snowpack_summary: string;
  lead_up_events: string;
  accident_summary: string;
  rescue_summary: string;
  involvement_summary: string;
  backcountry_avalanche_forecast: string;
  comments: string;
  weather_avalanche_snowpack_summary: string;
  location: string;
  group_comments: string;
  activity: string | null;
  travel_mode: string | null;
  links_avalanche_center: string;
  links_media: string;
  links_social_media: string;
  closest_avalanche_center: string;
  was_outside_forecast_area: boolean | null;
  danger_rating: string;
  had_avalanche_warning: boolean | null;
  forecast_comments: string;
  dispatched_at: string | null;
  arrived_on_scene_at: string | null;
  reported_at: string | null;
  authors: string;
  contributors: string;
  created_at: string;
  updated_at: string;
}

// Observation Types
interface AvalancheObservation extends BaseEntity {
  backcountry_zone_id: string;
  backcountry_zone: BackcountryZone;
  highway_zone_id: string | null;
  observed_at: string;
  water_year: number;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  comments: string;
  url: string;
  location: string | null;
  full_name: string;
  date_known: string;
  time_known: string | null;
  number: number;
  is_locked: boolean;
  hw_op_bc: string;
  path: string | null;
  landmark: string | null;
  type_code: string;
  problem_type: string | null;
  aspect: string;
  elevation: string;
  relative_size: string;
  destructive_size: string;
  primary_trigger: string;
  secondary_trigger: string | null;
  is_incident: boolean;
  area: string;
  angle: number | null;
  angle_average: number | null;
  angle_maximum: number | null;
  elevation_feet: number | null;
  surface: string | null;
  weak_layer: string | null;
  weak_layer_hardness: string | null;
  weak_layer_hardness_modifier: string | null;
  weak_layer_grain_type: string | null;
  weak_layer_grain_size: number | null;
  weak_layer_thickness: string | null;
  bed_surface_hardness: string | null;
  bed_surface_hardness_modifier: string | null;
  bed_surface_grain_type: string | null;
  bed_surface_grain_size: number | null;
  grain_type: string | null;
  crown_measured: string | null;
  crown_average: number | null;
  crown_maximum: number | null;
  crown_units: string | null;
  crown_location: string | null;
  slab_hardness: string | null;
  slab_hardness_modifier: string | null;
  slab_grain_type: string | null;
  slab_grain_size: number | null;
  slab_grain_comments: string;
  slope_characteristics: string[];
  start_zone_elevation: number | null;
  start_zone_elevation_units: string;
  start_zone_slope_angle_average: number | null;
  start_zone_slope_angle_maximum: number | null;
  start_zone_aspect_start: number | null;
  start_zone_aspect_end: number | null;
  start_zone_ground_cover: string | null;
  start_zone_snow_moisture: string | null;
  start_zone_comments: string;
  track_slope_angle_average: number | null;
  track_aspect: string | null;
  track_snow_moisture: string | null;
  track_shape: string | null;
  debris_toe_elevation: number | null;
  debris_toe_elevation_units: string;
  debris_density_average: number | null;
  debris_type: string[];
  run_out_average_incline: number | null;
  run_out_aspect: string | null;
  run_out_ground_cover: string | null;
  run_out_snow_moisture: string | null;
  alpha_angle_individual_avalanche: number | null;
  alpha_angle_extreme_event: number | null;
  had_terrain_trap: boolean | null;
  terrain_trap_type: string;
  avalanche_path_comments: string;
  width_average: number | null;
  width_maximum: number | null;
  width_units: string | null;
  vertical_average: number | null;
  vertical_maximum: number | null;
  vertical_units: string | null;
  terminus: string | null;
  road_status: string | null;
  road_depth: string | null;
  road_depth_units: string | null;
  road_length: string | null;
  road_length_units: string | null;
  comments_caic: string;
  avalanche_detail: AvalancheDetail;
}

interface SnowpackObservation extends BaseEntity {
  backcountry_zone_id: string;
  backcountry_zone: BackcountryZone;
  highway_zone_id: string | null;
  observed_at: string;
  water_year: number;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  comments: string | null;
  url: string;
  cracking: string | null;
  collapsing: string | null;
  weak_layers: string | null;
  rose: string | null;
  snowpack_detail: SnowpackDetail;
}

interface WeatherObservation extends BaseEntity {
  // Note: This type is inferred from context, as no complete example was in the JSON
  backcountry_zone_id: string;
  backcountry_zone: BackcountryZone;
  highway_zone_id: string | null;
  observed_at: string;
  water_year: number;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  comments: string | null;
  url: string;
  weather_detail: WeatherDetail;
}

// Asset Types
interface Asset extends BaseEntity {
  attachment_id: string;
  status: string;
  caption: string;
  tags: string | null;
  is_redacted: boolean;
  is_locked: boolean;
  is_avalanche: boolean;
  location_context: string | null;
  full_url: string;
  reduced_url: string;
  thumb_url: string;
  external_url: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

interface ImageAsset extends Asset {}

interface SnowpitAsset extends Asset {}

// Affected Group Types
interface AffectedGroup extends BaseEntity {
  normalized_degree_caught: string;
  normalized_degree_hurt: string;
  normalized_activity: string;
  normalized_travel_activity: string;
}

interface InvolvementSummary {
  involved: number;
  caught?: number;
  buried?: number;
  killed?: number;
  injured?: number;
  normalized_travel_activity: {
    [key: string]: number;
  };
}

// Main Report Types
export interface IncidentReport extends BaseEntity {
  backcountry_zone_id: string;
  backcountry_zone: BackcountryZone;
  highway_zone_id: string | null;
  observed_at: string;
  url: string;
  related_report_links: RelatedReportLinks;
  creator?: User;
  updater?: User;
  public_report_detail: PublicReportDetail;
  avalanche_observations_count: number;
  avalanche_observations: AvalancheObservation[];
  avalanche_detail: AvalancheDetail;
  weather_observations_count: number;
  weather_observations: WeatherObservation[];
  weather_detail: WeatherDetail;
  snowpack_observations_count: number;
  snowpack_observations: SnowpackObservation[];
  snowpack_detail: SnowpackDetail;
  assets_count: number;
  assets: (ImageAsset | SnowpitAsset)[];
  observation_form: string | null;
  is_anonymous: boolean;
  firstname?: string;
  lastname?: string;
  full_name?: string;
  organization?: string;
  comments_caic: string;
  status: string;
  investigation_status: string;
  date_known: string;
  time_known: string;
  hw_op_bc: string;
  area: string;
  route: string;
  is_locked: boolean;
  objective: string;
  saw_avalanche: boolean;
  triggered_avalanche: boolean;
  caught_in_avalanche: boolean;
  state: string;
  landmark: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_anonymous_location: boolean;
  latitude: number;
  longitude: number;
  report_id: string;
  parent_report_id: string;
  water_year: number;
  county: string | null;
  setting: string;
  is_us_forest_service: boolean | null;
  geographic_area: string | null;
  affected_damages: any[];
  affected_structures: any[];
  affected_vehicles: any[];
  affected_groups: AffectedGroup[];
  involvement_summary: InvolvementSummary;
}

/**
 * Type definitions for request parameters
 */
export interface ReportParams {
  page?: number;
  per?: number;
  observed_at_gteq?: Date | string;
  observed_at_lteq?: Date | string;
  is_locked_eq?: boolean;
  status_eq?: string;
  type_in?: string[];
  state_eq?: string;
  sorts?: string[];
  [key: string]: unknown; // Allow for additional parameters
}

// Root type for the array in the JSON
type IncidentReportCollection = IncidentReport[];

export function startOfAvalancheYear(input?: Date): Date {
  // Get current date in Denver time zone if no input is provided
  const today = input || new Date();

  // Convert to Denver time (Mountain Time)
  // Note: This uses the local machine's understanding of time zones
  const denverDate = new Date(
    today.toLocaleString("en-US", { timeZone: "America/Denver" }),
  );

  // Get the year and month (0-based in JavaScript)
  const month = denverDate.getMonth(); // 0-11 where 9 is October
  const year =
    month < 9 ? denverDate.getFullYear() - 1 : denverDate.getFullYear();

  // Create October 1st of the determined year in Denver time zone
  const result = new Date(Date.UTC(year, 9, 1, 6, 0, 0, 0)); // 6 AM UTC is midnight in Denver (UTC-6)

  // Adjust for daylight saving time if needed
  // This is a simplification - in real scenarios you might need more robust DST handling
  return result;
}

/**
 * Custom error class for API errors
 */
export class AvalancheApiError extends Error {
  readonly statusCode?: number;
  readonly response?: Response;

  constructor(message: string, statusCode?: number, response?: Response) {
    super(message);
    this.name = "AvalancheApiError";
    this.statusCode = statusCode;
    this.response = response;
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AvalancheApiError.prototype);
  }
}

/**
 * Configuration options for the Avalanche API client
 */
export interface AvalancheApiClientOptions {
  /** Base URL for the API */
  baseUrl?: string;
  /** Default request options to apply to all requests */
  defaultRequestOptions?: RequestInit;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Client for interacting with the Avalanche API
 */
export class AvalancheApiClient {
  private readonly baseUrl: string;
  private readonly defaultRequestOptions: RequestInit;
  private readonly timeout: number;

  /**
   * Creates a new Avalanche API client
   * @param options - Configuration options for the client
   */
  constructor(options: AvalancheApiClientOptions = {}) {
    this.baseUrl =
      options.baseUrl ??
      "https://avalanche.state.co.us/api-proxy/caic_data_api";
    this.defaultRequestOptions = options.defaultRequestOptions ?? {};
    this.timeout = options.timeout ?? 30000; // Default timeout: 30 seconds
  }

  /**
   * Formats a value for URL parameters
   * @param value - Value to format
   * @returns Formatted string value
   */
  private formatValue(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return String(value);
  }

  /**
   * Builds query parameters in the format expected by the API
   * @param params - Report parameters
   * @returns Formatted query string
   */
  private buildQueryParams(params: ReportParams): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;

      // Handle arrays specially
      if (Array.isArray(value)) {
        if (key === "type_in") {
          value.forEach((item) => searchParams.append(`r[type_in][]`, item));
        } else if (key === "sorts") {
          value.forEach((item) => searchParams.append(`r[sorts][]`, item));
        } else {
          // Generic array handling
          value.forEach((item) =>
            searchParams.append(`r[${key}][]`, this.formatValue(item)),
          );
        }
      } else {
        // Handle scalar values
        const paramKey = key === "page" || key === "per" ? key : `r[${key}]`;
        searchParams.append(paramKey, this.formatValue(value));
      }
    }

    return searchParams.toString();
  }

  /**
   * Fetches reports from the avalanche API
   * @param params - Parameters for filtering reports
   * @param options - Additional fetch options
   * @returns Promise resolving to the incident report collection
   * @throws {AvalancheApiError} If the request fails
   */
  public async getReports(
    params: ReportParams,
    options: RequestInit = {},
  ): Promise<IncidentReportCollection> {
    // Build query string
    const queryString = this.buildQueryParams(params);

    // Build the full URL for API proxy
    const apiProxyUri = encodeURIComponent(`/api/v2/reports?${queryString}`);
    const url = `${this.baseUrl}?_api_proxy_uri=${apiProxyUri}`;

    // Merge request options
    const requestOptions: RequestInit = {
      ...this.defaultRequestOptions,
      ...options,
      method: "GET",
      headers: {
        Accept: "application/json",
        ...this.defaultRequestOptions.headers,
        ...options.headers,
      },
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new AvalancheApiError(
          `API request failed with status ${response.status}`,
          response.status,
          response,
        );
      }

      return (await response.json()) as IncidentReportCollection;
    } catch (error) {
      if (error instanceof AvalancheApiError) {
        throw error;
      } else if (error instanceof DOMException && error.name === "AbortError") {
        throw new AvalancheApiError(
          `Request timed out after ${this.timeout}ms`,
        );
      } else {
        throw new AvalancheApiError(
          error instanceof Error ? error.message : "Unknown error occurred",
        );
      }
    }
  }
}

/** Example usage
 *
// example.ts
import { AvalancheApiClient, ReportParams } from './avalanche-api-client';

async function main() {
  // Create a client instance
  const client = new AvalancheApiClient({
    timeout: 10000, // 10 seconds timeout
  });
  
  // Define query parameters
  const params: ReportParams = {
    page: 1,
    per: 250,
    observed_at_gteq: startOfAvalancheYear(),
    observed_at_lteq: new Date(),
    is_locked_eq: false,
    status_eq: 'approved',
    type_in: ['incident_report', 'accident_report'],
    state_eq: 'CO',
    sorts: ['observed_at desc', 'created_at desc'],
  };
  
  try {
    // Fetch reports
    const reports = await client.getReports(params);
    console.log(`Retrieved ${reports.length} reports`);
    
    // Process first report
    if (reports.length > 0) {
      const report = reports[0];
      console.log(`Report ID: ${report.id}`);
      console.log(`Observed at: ${report.observed_at}`);
      console.log(`Location: ${report.area}, ${report.state}`);
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
  }
}

main().catch(console.error);
 */
