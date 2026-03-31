import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Use default imports to match your model exports
import User from '../models/User.model';
import Farmer from '../models/Farmer.model';
import Collector from '../models/Collector.model';
import Collection from '../models/Collection.model';
import Payment from '../models/Payment.model';
import Weather from '../models/Weather.model';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chaiyetu';

// Helper to format dates for IDs (YYYYMMDD)
const formatDateId = (date: Date) => {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // 1. Clear existing data
    console.log('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Farmer.deleteMany({}),
      Collector.deleteMany({}),
      Collection.deleteMany({}),
      Payment.deleteMany({}),
      Weather.deleteMany({}),
    ]);

    // 2. Create Collector
    const collectorUser = await User.create({
      firstName: 'James',
      lastName: 'Collector',
      email: 'james@chaiyetu.com',
      phone: '+254700000001',
      password: 'password123',
      role: 'collector',
      isActive: true,
    });

    const collector = await Collector.create({
      user: collectorUser._id,
      collectorId: 'C001',
      assignedArea: { county: 'Nyeri', subCounty: 'Mathira', wards: ['Giakaibei'] },
      vehicleDetails: { type: 'Truck', registration: 'KBA 123A', capacity: 1000 },
      status: 'active',
      totalCollections: 0,
      totalFarmers: 0
    });

    // 3. Create Farmers
    const sampleNames = [
      { first: 'John', last: 'Kamau' }, { first: 'Mary', last: 'Wanjiku' },
      { first: 'Peter', last: 'Maina' }, { first: 'Grace', last: 'Nyambura' },
      { first: 'David', last: 'Kariuki' }
    ];

    const farmers = [];
    let i = 0;
    for (const u of sampleNames) {
      if (!u) continue;

      const user = await User.create({
        firstName: u.first,
        lastName: u.last,
        email: `${u.first.toLowerCase()}@chaiyetu.com`,
        phone: `+2547${i}0000000`,
        password: 'password123',
        role: 'farmer',
        isActive: true,
      });

      const farmer = await Farmer.create({
        user: user._id,
        farmerId: `F00${i + 1}`,
        location: { 
          county: 'Nyeri', 
          subCounty: 'Mathira', 
          ward: 'Giakaibei', 
          village: 'Village A',
          coordinates: { lat: -0.4 + (Math.random() * 0.01), lng: 37.1 + (Math.random() * 0.01) }
        },
        farmSize: 1.5 + Math.random() * 4,
        teaVariety: 'TRFK 306/1',
        status: 'active',
      });
      farmers.push(farmer);
      i++;
    }
    console.log(`👨‍🌾 Created ${farmers.length} Farmers`);

    // 4. Generate 1 Year of Detailed Weather & Collections
    console.log('🌦️ Generating Complex Weather & Collections...');
    
    const weatherLogs = [];
    const collections = [];
    
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const today = new Date();

    // Global counter to prevent ID collisions
    let globalCollectionCounter = 1;

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const month = d.getMonth() + 1;
      
      // -- Seasonality Logic --
      let baseMinTemp = 12;
      let baseMaxTemp = 24;
      let rainChance = 0.2;
      let rainAmount = 0;

      if (month >= 3 && month <= 5) { // Long rains
        baseMinTemp = 14; baseMaxTemp = 23;
        rainChance = 0.7; rainAmount = Math.random() * 30 + 5;
      } else if (month >= 10 && month <= 12) { // Short rains
        baseMinTemp = 15; baseMaxTemp = 25;
        rainChance = 0.5; rainAmount = Math.random() * 20 + 2;
      } else if (month >= 6 && month <= 8) { // Cold season
        baseMinTemp = 8; baseMaxTemp = 18;
        rainChance = 0.1; rainAmount = Math.random() * 5;
      } else { // Hot/Dry
        baseMinTemp = 14; baseMaxTemp = 28;
        rainChance = 0.1; rainAmount = 0;
      }

      // Daily Weather
      const dailyMin = baseMinTemp + (Math.random() * 4 - 2);
      const dailyMax = baseMaxTemp + (Math.random() * 4 - 2);
      const dailyAvg = (dailyMin + dailyMax) / 2;
      const dailyRain = Math.random() < rainChance ? rainAmount : 0;
      const humidity = dailyRain > 0 ? 75 + Math.random() * 20 : 45 + Math.random() * 25;
      const cloudCover = dailyRain > 0 ? 70 + Math.random() * 30 : Math.random() * 40;

      weatherLogs.push({
        date: new Date(d),
        location: {
          type: 'region',
          coordinates: { lat: -0.42, lng: 37.15 },
          county: 'Nyeri',
          subCounty: 'Mathira',
          ward: 'Giakaibei',
          elevation: 1800
        },
        temperature: {
          min: parseFloat(dailyMin.toFixed(1)),
          max: parseFloat(dailyMax.toFixed(1)),
          avg: parseFloat(dailyAvg.toFixed(1)),
          feelsLike: parseFloat(dailyAvg.toFixed(1))
        },
        precipitation: {
          rainfall: parseFloat(dailyRain.toFixed(1)),
          humidity: parseFloat(humidity.toFixed(1)),
          snowfall: 0
        },
        wind: {
          speed: parseFloat((Math.random() * 15).toFixed(1)),
          direction: Math.floor(Math.random() * 360),
          gust: parseFloat((Math.random() * 20).toFixed(1))
        },
        pressure: {
          seaLevel: 1013 + Math.floor(Math.random() * 10 - 5),
          groundLevel: 900
        },
        clouds: {
          coverage: parseFloat(cloudCover.toFixed(0)),
          type: dailyRain > 0 ? ['nimbostratus'] : ['cumulus']
        },
        visibility: dailyRain > 10 ? 5000 : 10000,
        uvIndex: dailyRain > 0 ? 2 : 8,
        conditions: {
          droughtRisk: dailyRain === 0 && dailyMax > 26 ? 'medium' : 'low',
          frostRisk: dailyMin < 6 ? 'medium' : 'none',
          floodRisk: dailyRain > 25 ? 'high' : 'none',
          hailRisk: 'none',
          windDamageRisk: 'none'
        },
        solarRadiation: {
          dailyTotal: dailyRain > 0 ? 12 : 22,
          peak: 800,
          duration: dailyRain > 0 ? 4 : 10
        },
        source: 'station',
        isForecast: false,
        dataQuality: 'high'
      });

      // -- Create Collections --
      let yieldFactor = 1.0;
      if (month >= 4 && month <= 6) yieldFactor = 1.6;
      if (month >= 11 || month === 12) yieldFactor = 1.3;
      if (month === 1 || month === 2) yieldFactor = 0.5;

      if (d.getDay() !== 0) { 
        for (const farmer of farmers) {
          const pickChance = yieldFactor > 1 ? 0.3 : 0.15;
          
          if (Math.random() < pickChance) {
            const baseKilos = farmer.farmSize * 15;
            const weight = parseFloat((baseKilos * yieldFactor * (0.8 + Math.random() * 0.4)).toFixed(1));
            const price = 25; 

            // Create Unique ID: COL-YYYYMMDD-XXXX
            const idSuffix = globalCollectionCounter.toString().padStart(4, '0');
            const collectionId = `COL-${formatDateId(new Date(d))}-${idSuffix}`;
            globalCollectionCounter++;

            collections.push({
              collectionId: collectionId,
              farmer: farmer._id,
              collector: collector._id,
              weight: weight,
              quality: Math.random() > 0.9 ? 'grade2' : 'grade1',
              status: 'verified',
              collectionDate: new Date(d),
              pricePerKg: price,
              totalAmount: parseFloat((weight * price).toFixed(2)),
              location: {
                address: 'Farm Gate Collection',
                coordinates: {
                  lat: -0.42 + (Math.random() * 0.001), 
                  lng: 37.15 + (Math.random() * 0.001)
                }
              }
            });
          }
        }
      }
    }

    // Bulk Insert
    await Weather.insertMany(weatherLogs);
    await Collection.insertMany(collections);
    
    console.log(`✅ Success!`);
    console.log(`   - ${weatherLogs.length} Weather Records`);
    console.log(`   - ${collections.length} Tea Collections`);
    console.log('🚀 Database Seeded & Ready for ML Training');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();