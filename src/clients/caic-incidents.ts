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

/**
 * Type definitions for API response
 */
// Base Types
export interface BaseEntity {
  id: string;
  type: string;
}

export interface BackcountryZone extends BaseEntity {
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

// Including only essential types for brevity - see complete types in actual implementation
export interface AvalancheDetail extends BaseEntity {
  description: string;
  classic_id: string | null;
}

export interface WeatherDetail extends BaseEntity {
  description: string;
  classic_id: string | null;
}

export interface SnowpackDetail extends BaseEntity {
  description: string;
  classic_id: string | null;
}

export interface IncidentReport extends BaseEntity {
  // Full type definition from your example (omitted for brevity)
  backcountry_zone_id: string;
  backcountry_zone: BackcountryZone;
  // ... other properties
}

export type IncidentReportCollection = IncidentReport[];

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
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: Response,
  ) {
    super(message);
    this.name = "AvalancheApiError";
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
