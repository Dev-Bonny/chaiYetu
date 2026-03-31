import mongoose, { Document, Schema } from 'mongoose';

export interface IWeather extends Document {
  // Location reference
  farmer?: mongoose.Types.ObjectId;
  relatedCollection?: mongoose.Types.ObjectId;
  location: {
    type: 'farmer' | 'collection_point' | 'region';
    coordinates: {
      lat: number;
      lng: number;
    };
    address?: string;
    county: string;
    subCounty: string;
    ward?: string;
    elevation?: number;
  };

  // Weather data
  date: Date;
  temperature: {
    min: number;
    max: number;
    avg: number;
    feelsLike?: number;
  };
  precipitation: {
    rainfall: number;
    snowfall?: number;
    humidity: number;
    dewPoint?: number;
  };
  wind: {
    speed: number;
    direction: number;
    gust?: number;
  };
  pressure: {
    seaLevel: number;
    groundLevel?: number;
  };
  clouds: {
    coverage: number;
    type?: string[];
  };
  visibility?: number;
  uvIndex?: number;
  
  // Tea-specific weather conditions
  conditions: {
    droughtRisk: 'low' | 'medium' | 'high' | 'extreme';
    frostRisk: 'none' | 'low' | 'medium' | 'high';
    floodRisk: 'none' | 'low' | 'medium' | 'high';
    hailRisk: 'none' | 'low' | 'medium' | 'high';
    windDamageRisk: 'none' | 'low' | 'medium' | 'high';
  };

  // Solar radiation data
  solarRadiation?: {
    dailyTotal: number;
    peak: number;
    duration: number;
    photosyntheticallyActiveRadiation?: number;
  };

  // Soil conditions
  soil?: {
    moisture: number;
    temperature: number;
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
  };

  // Weather forecast data
  isForecast: boolean;
  forecastAccuracy?: number;
  forecastSource?: 'openweather' | 'meteomatics' | 'custom' | 'manual';

  // Quality indicators
  qualityScore?: number;
  growthFactor?: number;

  // Derived metrics
  metrics: {
    growingDegreeDays?: number;
    chillHours?: number;
    evapotranspiration?: number;
    waterDeficit?: number;
  };

  // Additional data
  sunrise?: Date;
  sunset?: Date;
  moonPhase?: 'new' | 'waxing' | 'full' | 'waning';
  
  // Metadata
  source: 'api' | 'station' | 'satellite' | 'manual';
  stationId?: string;
  apiProvider?: string;
  lastUpdated: Date;
  dataQuality: 'high' | 'medium' | 'low';
  
  // Notes and observations
  notes?: string;
  observer?: mongoose.Types.ObjectId;

  // Methods
  calculateChillHours(hourlyTemps: number[]): number;
  isSuitableForCollection(): { suitable: boolean; reasons: string[] };
  getAlerts(): Array<{ type: 'warning' | 'alert' | 'info'; message: string; severity: 'low' | 'medium' | 'high' }>;
}

// Model Interface for statics
interface IWeatherModel extends mongoose.Model<IWeather> {
  findByAreaAndDateRange(county: string, subCounty: string, startDate: Date, endDate: Date, options?: { isForecast?: boolean; limit?: number }): Promise<IWeather[]>;
  getWeatherSummary(location: { county: string; subCounty: string }, days?: number): Promise<any>;
}

const weatherSchema = new Schema<IWeather>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'Farmer', index: true },
    relatedCollection: { type: Schema.Types.ObjectId, ref: 'Collection', index: true },
    location: {
      type: { type: String, enum: ['farmer', 'collection_point', 'region'], required: true },
      coordinates: {
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
      },
      address: String,
      county: { type: String, required: true, trim: true },
      subCounty: { type: String, required: true, trim: true },
      ward: String,
      elevation: Number,
    },
    date: { type: Date, required: true, index: true },
    temperature: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      avg: { type: Number, required: true },
      feelsLike: Number,
    },
    precipitation: {
      rainfall: { type: Number, required: true, min: 0 },
      snowfall: { type: Number, min: 0 },
      humidity: { type: Number, required: true, min: 0, max: 100 },
      dewPoint: Number,
    },
    wind: {
      speed: { type: Number, required: true, min: 0 },
      direction: { type: Number, required: true, min: 0, max: 360 },
      gust: { type: Number, min: 0 },
    },
    pressure: {
      seaLevel: { type: Number, required: true, min: 870, max: 1085 },
      groundLevel: { type: Number, min: 870, max: 1085 },
    },
    clouds: {
      coverage: { type: Number, required: true, min: 0, max: 100 },
      type: { type: [String] }, 
    },
    visibility: { type: Number, min: 0 },
    uvIndex: { type: Number, min: 0 },
    conditions: {
      droughtRisk: { type: String, enum: ['low', 'medium', 'high', 'extreme'], default: 'low' },
      frostRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
      floodRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
      hailRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
      windDamageRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
    },
    solarRadiation: {
      dailyTotal: { type: Number, min: 0 },
      peak: { type: Number, min: 0 },
      duration: { type: Number, min: 0, max: 24 },
      photosyntheticallyActiveRadiation: { type: Number, min: 0 },
    },
    soil: {
      moisture: { type: Number, min: 0, max: 100 },
      temperature: Number,
      ph: { type: Number, min: 0, max: 14 },
      nitrogen: { type: Number, min: 0 },
      phosphorus: { type: Number, min: 0 },
      potassium: { type: Number, min: 0 },
    },
    isForecast: { type: Boolean, default: false, index: true },
    forecastAccuracy: { type: Number, min: 0, max: 1 },
    forecastSource: { type: String, enum: ['openweather', 'meteomatics', 'custom', 'manual'] },
    qualityScore: { type: Number, min: 1, max: 10 },
    growthFactor: { type: Number, min: 0, max: 2 },
    metrics: {
      growingDegreeDays: { type: Number, min: 0 },
      chillHours: { type: Number, min: 0 },
      evapotranspiration: { type: Number, min: 0 },
      waterDeficit: { type: Number },
    },
    sunrise: Date,
    sunset: Date,
    moonPhase: { type: String, enum: ['new', 'waxing', 'full', 'waning'] },
    source: { type: String, enum: ['api', 'station', 'satellite', 'manual'], required: true },
    stationId: String,
    apiProvider: String,
    lastUpdated: { type: Date, required: true, default: Date.now },
    dataQuality: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    notes: { type: String, maxlength: 1000 },
    observer: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// FIX: Cast 'this' to any to avoid TypeScript conflicting schema types with interface types
weatherSchema.virtual('summary').get(function (this: any) {
  const summaries: string[] = [];
  if (this.temperature.avg < 10) summaries.push('Cold');
  if (this.temperature.avg > 25) summaries.push('Hot');
  if (this.precipitation.rainfall > 20) summaries.push('Rainy');
  if (this.precipitation.rainfall < 1 && this.clouds.coverage < 20) summaries.push('Clear');
  if (this.wind.speed > 20) summaries.push('Windy');
  if (summaries.length === 0) {
    if (this.precipitation.rainfall > 5) summaries.push('Light Rain');
    else summaries.push('Moderate');
  }
  return summaries.join(', ');
});

// FIX: Cast 'this' to any
weatherSchema.virtual('idealTeaConditions').get(function (this: any) {
  const idealTemp = this.temperature.avg >= 18 && this.temperature.avg <= 24;
  const idealRain = this.precipitation.rainfall >= 3 && this.precipitation.rainfall <= 8;
  const idealHumidity = this.precipitation.humidity >= 70 && this.precipitation.humidity <= 85;
  
  return {
    temperature: idealTemp,
    rainfall: idealRain,
    humidity: idealHumidity,
    score: (idealTemp ? 0.4 : 0) + (idealRain ? 0.3 : 0) + (idealHumidity ? 0.3 : 0),
  };
});

// FIX: Cast 'this' to any
weatherSchema.pre('save', function (this: any, next) {
  if (this.isModified('temperature') || this.isModified('precipitation')) {
    let score = 5;
    const temp = this.temperature.avg;
    if (temp >= 18 && temp <= 24) score += 2;
    else if (temp >= 15 && temp <= 27) score += 1;
    else if (temp < 10 || temp > 30) score -= 2;

    const rain = this.precipitation.rainfall;
    if (rain >= 3 && rain <= 8) score += 1.5;
    else if (rain >= 1 && rain <= 15) score += 0.5;
    else if (rain > 20) score -= 1;

    const humidity = this.precipitation.humidity;
    if (humidity >= 70 && humidity <= 85) score += 1.5;
    else if (humidity >= 60 && humidity <= 90) score += 0.5;

    if (this.conditions.droughtRisk === 'high') score -= 1;
    if (this.conditions.droughtRisk === 'extreme') score -= 2;
    if (this.conditions.frostRisk === 'high') score -= 2;
    if (this.conditions.floodRisk === 'high') score -= 1.5;

    this.qualityScore = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
    const growthFactor = 1 + ((this.qualityScore - 5) / 10);
    this.growthFactor = Math.max(0, Math.min(2, Math.round(growthFactor * 100) / 100));

    const baseTemp = 10;
    const avgTemp = this.temperature.avg;
    this.metrics.growingDegreeDays = Math.max(0, avgTemp - baseTemp);

    if (this.temperature.avg && this.precipitation.humidity && this.wind.speed && this.solarRadiation?.dailyTotal) {
      const T = this.temperature.avg;
      const Ra = this.solarRadiation.dailyTotal || 15;
      this.metrics.evapotranspiration = 0.0023 * Ra * Math.pow(T + 17.8, 0.5) * (T - 10);
    }
  }
  this.lastUpdated = new Date();
  next();
});

weatherSchema.methods.calculateChillHours = function (hourlyTemps: number[]): number {
  return hourlyTemps.filter(temp => temp < 7).length;
};

weatherSchema.methods.isSuitableForCollection = function (this: any): { suitable: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (this.temperature.avg < 15) reasons.push('Temperature too low for optimal tea quality');
  if (this.temperature.avg > 25) reasons.push('Temperature too high, tea may wilt quickly');
  if (this.precipitation.rainfall > 5) reasons.push('Recent rainfall may affect tea moisture content');
  if (this.wind.speed > 15) reasons.push('Windy conditions may affect collection');
  if (this.sunrise && this.sunset) {
    const now = new Date();
    const sunrise = new Date(this.sunrise);
    const sunset = new Date(this.sunset);
    if (now < sunrise || now > sunset) reasons.push('Outside optimal collection hours');
  }
  return { suitable: reasons.length === 0, reasons };
};

weatherSchema.methods.getAlerts = function (this: any) {
  const alerts: any[] = [];
  if (this.temperature.min < 5) alerts.push({ type: 'alert', message: 'Frost warning', severity: 'high' });
  else if (this.temperature.min < 10) alerts.push({ type: 'warning', message: 'Cold conditions', severity: 'medium' });
  if (this.temperature.max > 30) alerts.push({ type: 'alert', message: 'Heat stress warning', severity: 'high' });
  if (this.precipitation.rainfall > 20) alerts.push({ type: 'alert', message: 'Heavy rainfall', severity: 'high' });
  else if (this.precipitation.rainfall > 10) alerts.push({ type: 'warning', message: 'Moderate rainfall', severity: 'medium' });
  return alerts;
};

// Static Methods
weatherSchema.statics.findByAreaAndDateRange = async function (
  county: string,
  subCounty: string,
  startDate: Date,
  endDate: Date,
  options: { isForecast?: boolean; limit?: number } = {}
): Promise<IWeather[]> {
  const query: any = {
    'location.county': county,
    'location.subCounty': subCounty,
    date: { $gte: startDate, $lte: endDate },
  };
  if (options.isForecast !== undefined) query.isForecast = options.isForecast;
  return this.find(query).sort({ date: 1 }).limit(options.limit || 100).exec();
};

weatherSchema.statics.getWeatherSummary = async function (
  location: { county: string; subCounty: string },
  days: number = 7
) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const weatherData = await this.find({
    'location.county': location.county,
    'location.subCounty': location.subCounty,
    date: { $gte: startDate, $lte: endDate },
    isForecast: false,
  }).sort({ date: 1 });

  if (weatherData.length === 0) throw new Error('No weather data found for the specified period');

  const avgTemp = weatherData.reduce((sum: number, w: IWeather) => sum + w.temperature.avg, 0) / weatherData.length;
  const avgRain = weatherData.reduce((sum: number, w: IWeather) => sum + w.precipitation.rainfall, 0) / weatherData.length;
  const avgHumidity = weatherData.reduce((sum: number, w: IWeather) => sum + w.precipitation.humidity, 0) / weatherData.length;
  const avgWind = weatherData.reduce((sum: number, w: IWeather) => sum + w.wind.speed, 0) / weatherData.length;

  const totalRain = weatherData.reduce((sum: number, w: IWeather) => sum + w.precipitation.rainfall, 0);
  const totalGDD = weatherData.reduce((sum: number, w: IWeather) => sum + (w.metrics.growingDegreeDays || 0), 0);

  const recentAlerts = weatherData[weatherData.length - 1]?.getAlerts() || [];
  const recommendations: string[] = [];
  if (totalRain < 20) recommendations.push('Consider irrigation');
  if (totalRain > 100) recommendations.push('Monitor drainage');

  return {
    period: { start: startDate, end: endDate },
    averages: {
      temperature: Math.round(avgTemp * 10) / 10,
      rainfall: Math.round(avgRain * 10) / 10,
      humidity: Math.round(avgHumidity * 10) / 10,
      windSpeed: Math.round(avgWind * 10) / 10,
    },
    totals: {
      rainfall: Math.round(totalRain * 10) / 10,
      growingDegreeDays: Math.round(totalGDD * 10) / 10,
    },
    alerts: recentAlerts,
    recommendations,
  };
};

weatherSchema.index({ 'location.coordinates': '2dsphere' });
weatherSchema.index({ date: 1, 'location.county': 1, 'location.subCounty': 1 });

export default mongoose.model<IWeather, IWeatherModel>('Weather', weatherSchema);