import axios from 'axios';
import Weather, { IWeather } from '../models/Weather.model';
import logger from '../utils/logger.utils';

export class WeatherService {
  private readonly API_KEY = process.env.WEATHER_API_KEY;
  private readonly BASE_URL = 'https://api.openweathermap.org/data/3.0';

  async fetchWeatherData(lat: number, lng: number, date?: Date): Promise<any> {
    try {
      const response = await axios.get(`${this.BASE_URL}/onecall`, {
        params: {
          lat,
          lon: lng,
          appid: this.API_KEY,
          units: 'metric',
          exclude: 'minutely,alerts',
          ...(date && { dt: Math.floor(date.getTime() / 1000) }),
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch weather data:', error);
      throw new Error('Weather API request failed');
    }
  }

  async createWeatherRecord(data: Partial<IWeather>): Promise<IWeather> {
    const weather = new Weather(data);
    return await weather.save();
  }

  async updateWeatherForFarmer(farmerId: string, weatherData: any): Promise<IWeather> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await Weather.findOne({
      farmer: farmerId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existing) {
      // FIX: assert non-null since we know the document exists
      const updated = await Weather.findByIdAndUpdate(existing._id, weatherData, { new: true });
      return updated as IWeather;
    }

    return await this.createWeatherRecord({
      ...weatherData,
      farmer: farmerId,
      date: new Date(),
    });
  }

  async getWeatherAlerts(location: { county: string; subCounty: string }): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weatherData = await Weather.findOne({
      'location.county': location.county,
      'location.subCounty': location.subCounty,
      date: { $gte: today },
      isForecast: false,
    }).sort({ date: -1 });

    return weatherData?.getAlerts() || [];
  }

  async getWeatherForecast(location: { lat: number; lng: number }, days: number = 7): Promise<any[]> {
    const weatherData = await this.fetchWeatherData(location.lat, location.lng);

    const forecasts = weatherData.daily.slice(0, days).map((day: any) => ({
      date: new Date(day.dt * 1000),
      temperature: {
        min: Math.round(day.temp.min),
        max: Math.round(day.temp.max),
        avg: Math.round((day.temp.min + day.temp.max) / 2),
      },
      precipitation: {
        rainfall: day.rain || 0,
        humidity: day.humidity,
      },
      wind: {
        speed: Math.round(day.wind_speed * 3.6),
        direction: day.wind_deg,
      },
      clouds: {
        coverage: day.clouds,
      },
      conditions: this.calculateRiskFactors(day),
      isForecast: true,
      forecastAccuracy: 0.85,
      source: 'api',
    }));

    return forecasts;
  }

  private calculateRiskFactors(weatherData: any): {
    droughtRisk: 'low' | 'medium' | 'high' | 'extreme';
    frostRisk: 'none' | 'low' | 'medium' | 'high';
    floodRisk: 'none' | 'low' | 'medium' | 'high';
    hailRisk: 'none' | 'low' | 'medium' | 'high';
    windDamageRisk: 'none' | 'low' | 'medium' | 'high';
  } {
    // FIX: declare with explicit union types instead of `as const`
    // so values can be reassigned freely within the union
    let droughtRisk:    'low' | 'medium' | 'high' | 'extreme'  = 'low';
    let frostRisk:      'none' | 'low' | 'medium' | 'high'     = 'none';
    let floodRisk:      'none' | 'low' | 'medium' | 'high'     = 'none';
    let hailRisk:       'none' | 'low' | 'medium' | 'high'     = 'none';
    let windDamageRisk: 'none' | 'low' | 'medium' | 'high'     = 'none';

    // Drought risk
    if ((weatherData.rain || 0) < 1 && weatherData.temp.max > 25) {
      droughtRisk = 'medium';
    }
    if ((weatherData.rain || 0) < 1 && weatherData.temp.max > 30) {
      droughtRisk = 'high';
    }

    // Frost risk
    if (weatherData.temp.min < 5) {
      frostRisk = 'high';
    } else if (weatherData.temp.min < 10) {
      frostRisk = 'low';
    }

    // Flood risk
    if ((weatherData.rain || 0) > 20) {
      floodRisk = 'high';
    } else if ((weatherData.rain || 0) > 10) {
      floodRisk = 'medium';
    }

    // Wind damage risk
    if ((weatherData.wind_speed * 3.6) > 30) {
      windDamageRisk = 'high';
    } else if ((weatherData.wind_speed * 3.6) > 20) {
      windDamageRisk = 'medium';
    }

    return { droughtRisk, frostRisk, floodRisk, hailRisk, windDamageRisk };
  }
}

export default new WeatherService();