interface GridPointsResponse {
  properties: {
    gridId: string;
    gridX: number;
    gridY: number;
    forecast: string;
    forecastHourly: string;
    timeZone: string;
    radarStation: string;
  };
}

interface Period {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend: string | null;
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}

interface ForecastResponse {
  properties: {
    updated: string;
    units: string;
    forecastGenerator: string;
    generatedAt: string;
    updateTime: string;
    validTimes: string;
    elevation: {
      unitCode: string;
      value: number;
    };
    periods: Period[];
  };
}

interface HourlyForecastResponse {
  properties: {
    periods: Period[];
  };
}

export class WeatherGovClient {
  private readonly baseUrl: string = "https://api.weather.gov";

  async getGridPoints(
    latitude: number,
    longitude: number,
  ): Promise<GridPointsResponse> {
    const url = `${this.baseUrl}/points/${latitude},${longitude}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch grid points: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async getForecast(
    gridId: string,
    gridX: number,
    gridY: number,
  ): Promise<ForecastResponse> {
    const url = `${this.baseUrl}/gridpoints/${gridId}/${gridX},${gridY}/forecast`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch forecast: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async getHourlyForecast(
    gridId: string,
    gridX: number,
    gridY: number,
  ): Promise<HourlyForecastResponse> {
    const url = `${this.baseUrl}/gridpoints/${gridId}/${gridX},${gridY}/forecast/hourly`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch hourly forecast: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }
}
