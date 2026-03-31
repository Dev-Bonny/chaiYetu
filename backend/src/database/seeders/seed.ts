import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../../models/User.model';
import Farmer from '../../models/Farmer.model';
import Collector from '../../models/Collector.model';
import Collection from '../../models/Collection.model';
import Payment from '../../models/Payment.model';
import Prediction from '../../models/Prediction.model';
import connectDB from '../../config/database.config';
import logger from '../../utils/logger.utils';

dotenv.config();

class DatabaseSeeder {
  // ✅ FIX: Changed to public
  public async connect(): Promise<void> {
    try {
      await connectDB();
      logger.info('Connected to database for seeding');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      process.exit(1);
    }
  }

  // ✅ FIX: Changed to public
  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
    }
  }

  // ✅ FIX: Changed to public
  public async clearDatabase(): Promise<void> {
    try {
      logger.info('Clearing existing data...');
      await Promise.all([
        User.deleteMany({}),
        Farmer.deleteMany({}),
        Collector.deleteMany({}),
        Collection.deleteMany({}),
        Payment.deleteMany({}),
        Prediction.deleteMany({}),
      ]);
      logger.info('Database cleared successfully');
    } catch (error) {
      logger.error('Error clearing database:', error);
      throw error;
    }
  }

  private async seedUsers(): Promise<any[]> {
    const users = [
      // Admin Users
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@chaiyetu.com',
        phone: '+254700000001',
        password: 'Admin@123',
        role: 'admin' as const,
        isActive: true,
      },
      {
        firstName: 'Factory',
        lastName: 'Manager',
        email: 'manager@chaiyetu.com',
        phone: '+254700000002',
        password: 'Manager@123',
        role: 'factory_manager' as const,
        isActive: true,
      },

      // Collector Users
      {
        firstName: 'John',
        lastName: 'Collector',
        email: 'collector1@chaiyetu.com',
        phone: '+254711111111',
        password: 'Collector@123',
        role: 'collector' as const,
        isActive: true,
      },
      {
        firstName: 'Mary',
        lastName: 'Collector',
        email: 'collector2@chaiyetu.com',
        phone: '+254722222222',
        password: 'Collector@123',
        role: 'collector' as const,
        isActive: true,
      },
      {
        firstName: 'Peter',
        lastName: 'Collector',
        email: 'collector3@chaiyetu.com',
        phone: '+254733333333',
        password: 'Collector@123',
        role: 'collector' as const,
        isActive: true,
      },

      // Farmer Users (10 farmers)
      {
        firstName: 'Samuel',
        lastName: 'Kamau',
        email: 'samuel.kamau@example.com',
        phone: '+254744444444',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Grace',
        lastName: 'Wanjiku',
        email: 'grace.wanjiku@example.com',
        phone: '+254755555555',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Joseph',
        lastName: 'Mwangi',
        email: 'joseph.mwangi@example.com',
        phone: '+254766666666',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Esther',
        lastName: 'Nyambura',
        email: 'esther.nyambura@example.com',
        phone: '+254777777777',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'David',
        lastName: 'Kiprop',
        email: 'david.kiprop@example.com',
        phone: '+254788888888',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Chebet',
        email: 'sarah.chebet@example.com',
        phone: '+254799999999',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Michael',
        lastName: 'Ochieng',
        email: 'michael.ochieng@example.com',
        phone: '+254710101010',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Ruth',
        lastName: 'Akinyi',
        email: 'ruth.akinyi@example.com',
        phone: '+254721212121',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Paul',
        lastName: 'Kariuki',
        email: 'paul.kariuki@example.com',
        phone: '+254732323232',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
      {
        firstName: 'Mercy',
        lastName: 'Muthoni',
        email: 'mercy.muthoni@example.com',
        phone: '+254743434343',
        password: 'Farmer@123',
        role: 'farmer' as const,
        isActive: true,
      },
    ];

    try {
      logger.info('Seeding users...');
      const createdUsers = [];
      // ✅ FIX: Loop + create to trigger password hashing hook
      for (const user of users) {
        createdUsers.push(await User.create(user));
      }
      logger.info(`Created ${createdUsers.length} users`);
      return createdUsers;
    } catch (error) {
      logger.error('Error seeding users:', error);
      throw error;
    }
  }

  private async seedFarmers(users: any[]): Promise<any[]> {
    const farmerUsers = users.filter(user => user.role === 'farmer');
    const collectors = await Collector.find();
    
    const farmerData = farmerUsers.map((user, index) => ({
      user: user._id,
      farmerId: '', // Will be auto-generated by hook
      location: {
        county: index % 2 === 0 ? 'Kiambu' : 'Kericho',
        subCounty: index % 2 === 0 ? 'Gatundu' : 'Buret',
        ward: index % 2 === 0 ? 'Gatundu North' : 'Londiani',
        village: index % 2 === 0 ? 'Mangu' : 'Cheborge',
        coordinates: {
          lat: -1.0 + (index * 0.1),
          lng: 36.8 + (index * 0.1),
        },
      },
      farmSize: 2 + (index * 0.5),
      teaVariety: index % 3 === 0 ? 'TRFK 306' : index % 3 === 1 ? 'BB 35' : 'EPK TN14-3',
      registrationDate: new Date(Date.now() - (index * 30 * 24 * 60 * 60 * 1000)), // Staggered dates
      status: 'active' as const,
      collector: collectors[index % collectors.length]?._id,
      bankDetails: index < 5 ? {
        bankName: 'Equity Bank',
        accountNumber: `001234567${index}`,
        accountName: `${user.firstName} ${user.lastName}`,
      } : undefined,
    }));

    try {
      logger.info('Seeding farmers...');
      const createdFarmers = [];
      // ✅ FIX: Loop + create to trigger farmerId generation hook
      for (const data of farmerData) {
        createdFarmers.push(await Farmer.create(data));
      }
      logger.info(`Created ${createdFarmers.length} farmers`);
      return createdFarmers;
    } catch (error) {
      logger.error('Error seeding farmers:', error);
      throw error;
    }
  }

  private async seedCollectors(users: any[]): Promise<any[]> {
    const collectorUsers = users.filter(user => user.role === 'collector');
    
    const collectorData = [
      {
        user: collectorUsers[0]._id,
        collectorId: '', // Will be auto-generated
        assignedArea: {
          county: 'Kiambu',
          subCounty: 'Gatundu',
          wards: ['Gatundu North', 'Gatundu South'],
        },
        vehicleDetails: {
          type: 'Pickup Truck',
          registration: 'KCA 123A',
          capacity: 1000,
        },
        status: 'active' as const,
        totalCollections: 0,
        totalFarmers: 0,
      },
      {
        user: collectorUsers[1]._id,
        collectorId: '', // Will be auto-generated
        assignedArea: {
          county: 'Kericho',
          subCounty: 'Buret',
          wards: ['Londiani', 'Cheborge'],
        },
        vehicleDetails: {
          type: 'Lorry',
          registration: 'KCB 456B',
          capacity: 2000,
        },
        status: 'active' as const,
        totalCollections: 0,
        totalFarmers: 0,
      },
      {
        user: collectorUsers[2]._id,
        collectorId: '', // Will be auto-generated
        assignedArea: {
          county: 'Kiambu',
          subCounty: 'Thika',
          wards: ['Township', 'Kamenu'],
        },
        vehicleDetails: {
          type: 'Van',
          registration: 'KCC 789C',
          capacity: 500,
        },
        status: 'on_leave' as const,
        totalCollections: 0,
        totalFarmers: 0,
      },
    ];

    try {
      logger.info('Seeding collectors...');
      const createdCollectors = [];
      // ✅ FIX: Loop + create to trigger collectorId generation hook
      for (const data of collectorData) {
        createdCollectors.push(await Collector.create(data));
      }
      logger.info(`Created ${createdCollectors.length} collectors`);
      return createdCollectors;
    } catch (error) {
      logger.error('Error seeding collectors:', error);
      throw error;
    }
  }

  private async seedCollections(farmers: any[], collectors: any[]): Promise<any[]> {
    const collections = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // 3 months ago

    for (let i = 0; i < 50; i++) {
      const farmer = farmers[i % farmers.length];
      const collector = collectors[i % collectors.length];
      const collectionDate = new Date(startDate);
      collectionDate.setDate(startDate.getDate() + i); // Staggered dates

      const weight = 20 + Math.floor(Math.random() * 30); // 20-50 kg
      const quality = i % 3 === 0 ? 'grade1' : i % 3 === 1 ? 'grade2' : 'grade3' as const;
      const pricePerKg = quality === 'grade1' ? 25 : quality === 'grade2' ? 20 : 15;

      collections.push({
        collectionId: '', // Will be auto-generated
        farmer: farmer._id,
        collector: collector._id,
        collectionDate,
        weight,
        quality,
        pricePerKg,
        totalAmount: weight * pricePerKg,
        imageUrl: i % 5 === 0 ? `/uploads/collection-${i + 1}.jpg` : undefined,
        location: {
          coordinates: {
            lat: farmer.location.coordinates.lat + (Math.random() * 0.01 - 0.005),
            lng: farmer.location.coordinates.lng + (Math.random() * 0.01 - 0.005),
          },
          address: `${farmer.location.village}, ${farmer.location.ward}`,
        },
        status: (() => {
          if (i < 30) return 'verified' as const;
          if (i < 35) return 'pending' as const;
          if (i < 40) return 'rejected' as const;
          return 'paid' as const;
        })(),
        verifiedBy: i >= 30 ? undefined : (await User.findOne({ role: 'admin' }))?._id,
        verificationDate: i >= 30 ? undefined : new Date(collectionDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        notes: i % 7 === 0 ? `Collection note ${i + 1}: Good quality tea leaves` : undefined,
      });
    }

    try {
      logger.info('Seeding collections...');
      const createdCollections = [];
      // ✅ FIX: Loop + create ensures hooks run (e.g. ID generation)
      for (const data of collections) {
        createdCollections.push(await Collection.create(data));
      }
      logger.info(`Created ${createdCollections.length} collections`);
      
      // Update collector stats
      for (const collector of collectors) {
        const count = await Collection.countDocuments({ collector: collector._id });
        const farmerCount = await Farmer.countDocuments({ collector: collector._id });
        await Collector.findByIdAndUpdate(collector._id, {
          totalCollections: count,
          totalFarmers: farmerCount,
        });
      }
      
      return createdCollections;
    } catch (error) {
      logger.error('Error seeding collections:', error);
      throw error;
    }
  }

  private async seedPayments(farmers: any[], collections: any[]): Promise<any[]> {
    const payments = [];
    const adminUser = await User.findOne({ role: 'admin' });

    // Group collections by farmer and status
    const farmerCollections = new Map();
    
    for (const collection of collections) {
      if (collection.status === 'verified' || collection.status === 'paid') {
        if (!farmerCollections.has(collection.farmer.toString())) {
          farmerCollections.set(collection.farmer.toString(), []);
        }
        farmerCollections.get(collection.farmer.toString()).push(collection);
      }
    }

    let paymentIndex = 0;
    for (const [farmerId, farmerCollectionsList] of farmerCollections) {
      if (farmerCollectionsList.length === 0) continue;

      // Create 1-2 payments per farmer
      const paymentCount = Math.min(2, Math.ceil(farmerCollectionsList.length / 5));
      
      for (let i = 0; i < paymentCount; i++) {
        const startIndex = i * 3;
        const endIndex = Math.min(startIndex + 3, farmerCollectionsList.length);
        const paymentCollections = farmerCollectionsList.slice(startIndex, endIndex);
        
        if (paymentCollections.length === 0) continue;

        // ✅ FIX: Added types (sum: number, col: any)
        const totalAmount = paymentCollections.reduce((sum: number, col: any) => sum + col.totalAmount, 0);
        const paymentDate = new Date(paymentCollections[0].collectionDate);
        paymentDate.setDate(paymentDate.getDate() + 7); // 1 week after collection

        payments.push({
          paymentId: '', // Will be auto-generated
          farmer: farmerId,
          // ✅ FIX: Added type (col: any)
          collections: paymentCollections.map((col: any) => col._id),
          totalAmount,
          paymentDate,
          paymentMethod: paymentIndex % 3 === 0 ? 'mpesa' : paymentIndex % 3 === 1 ? 'bank_transfer' : 'cash' as const,
          status: (() => {
            if (paymentIndex < 5) return 'completed' as const;
            if (paymentIndex < 7) return 'processing' as const;
            if (paymentIndex < 8) return 'failed' as const;
            return 'pending' as const;
          })(),
          mpesaReference: paymentIndex % 3 === 0 ? `MPE${Date.now()}${paymentIndex}` : undefined,
          bankReference: paymentIndex % 3 === 1 ? `BANK${Date.now()}${paymentIndex}` : undefined,
          processedBy: adminUser?._id,
          processedAt: paymentIndex < 8 ? new Date(paymentDate.getTime() + 24 * 60 * 60 * 1000) : undefined, // 1 day later
          failureReason: paymentIndex === 7 ? 'Insufficient funds' : undefined,
        });

        paymentIndex++;

        // Update collection status to paid for completed payments
        if (paymentIndex <= 5) {
          await Collection.updateMany(
            // ✅ FIX: Added type (col: any)
            { _id: { $in: paymentCollections.map((col: any) => col._id) } },
            { $set: { status: 'paid' } }
          );
        }
      }
    }

    try {
      logger.info('Seeding payments...');
      const createdPayments = [];
      // ✅ FIX: Loop + create
      for (const data of payments) {
        createdPayments.push(await Payment.create(data));
      }
      logger.info(`Created ${createdPayments.length} payments`);
      return createdPayments;
    } catch (error) {
      logger.error('Error seeding payments:', error);
      throw error;
    }
  }

  private async seedPredictions(farmers: any[]): Promise<any[]> {
    const predictions = [];
    const currentDate = new Date();

    for (let i = 0; i < 20; i++) {
      const farmer = farmers[i % farmers.length];
      const predictionDate = new Date(currentDate);
      predictionDate.setDate(currentDate.getDate() - i); // Past dates for testing

      const predictionType = i % 2 === 0 ? 'weight' as const : 'payment' as const;
      const predictedValue = predictionType === 'weight' 
        ? 25 + Math.random() * 15 
        : 1500 + Math.random() * 1000;
      
      const actualValue = predictionType === 'weight'
        ? predictedValue * (0.9 + Math.random() * 0.2) // ±10% variation
        : predictedValue * (0.85 + Math.random() * 0.3); // ±15% variation

      predictions.push({
        farmer: farmer._id,
        predictionDate,
        predictionType,
        predictedValue,
        confidence: 0.7 + Math.random() * 0.25, // 0.7-0.95
        inputFeatures: {
          historicalData: [
            { date: new Date(predictionDate.getTime() - 86400000), value: predictedValue * 0.9 },
            { date: new Date(predictionDate.getTime() - 172800000), value: predictedValue * 0.85 },
          ],
          weatherData: {
            rainfall: 5 + Math.random() * 10,
            temperature: 20 + Math.random() * 10,
            humidity: 60 + Math.random() * 20,
          },
          seasonalFactors: {
            season: predictionDate.getMonth() < 4 ? 'long_rains' : 
                   predictionDate.getMonth() < 8 ? 'cold_season' : 'short_rains',
            factor: 0.9 + Math.random() * 0.2,
          },
        },
        actualValue,
        accuracy: Math.abs(predictedValue - actualValue) / actualValue,
        status: (() => {
          const diff = Math.abs(predictedValue - actualValue) / actualValue;
          return diff < 0.15 ? 'accurate' as const : 'inaccurate' as const;
        })(),
      });
    }

    try {
      logger.info('Seeding predictions...');
      const createdPredictions = [];
      // ✅ FIX: Loop + create
      for (const data of predictions) {
        createdPredictions.push(await Prediction.create(data));
      }
      logger.info(`Created ${createdPredictions.length} predictions`);
      return createdPredictions;
    } catch (error) {
      logger.error('Error seeding predictions:', error);
      throw error;
    }
  }

  public async seed(): Promise<void> {
    try {
      await this.connect();
      await this.clearDatabase();

      logger.info('Starting database seeding...');

      // Seed in order
      const users = await this.seedUsers();
      const collectors = await this.seedCollectors(users);
      const farmers = await this.seedFarmers(users);
      const collections = await this.seedCollections(farmers, collectors);
      const payments = await this.seedPayments(farmers, collections);
      const predictions = await this.seedPredictions(farmers);

      // Summary
      logger.info('\n=== Seeding Summary ===');
      logger.info(`Users: ${users.length}`);
      logger.info(`Collectors: ${collectors.length}`);
      logger.info(`Farmers: ${farmers.length}`);
      logger.info(`Collections: ${collections.length}`);
      logger.info(`Payments: ${payments.length}`);
      logger.info(`Predictions: ${predictions.length}`);
      logger.info('=== Seeding Completed Successfully ===\n');

      // Display sample credentials
      this.displaySampleCredentials(users);

    } catch (error) {
      logger.error('Seeding failed:', error);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }

  private displaySampleCredentials(users: any[]): void {
    logger.info('\n=== Sample Login Credentials ===');
    
    const admin = users.find(u => u.role === 'admin');
    const manager = users.find(u => u.role === 'factory_manager');
    const collector = users.find(u => u.role === 'collector');
    const farmer = users.find(u => u.role === 'farmer');

    if (admin) {
      logger.info(`Admin: ${admin.email} / Admin@123`);
    }
    if (manager) {
      logger.info(`Manager: ${manager.email} / Manager@123`);
    }
    if (collector) {
      logger.info(`Collector: ${collector.email} / Collector@123`);
    }
    if (farmer) {
      logger.info(`Farmer: ${farmer.email} / Farmer@123`);
    }
    
    logger.info('================================\n');
  }
}

// Run seeder
const seeder = new DatabaseSeeder();

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--seed':
    seeder.seed();
    break;
  case '--clear':
    seeder.connect()
      .then(() => seeder.clearDatabase())
      .then(() => seeder.disconnect())
      .then(() => logger.info('Database cleared successfully'))
      .catch(error => {
        logger.error('Failed to clear database:', error);
        process.exit(1);
      });
    break;
  default:
    logger.info('Usage:');
    logger.info('  npm run seed:db    -- Seed database with sample data');
    logger.info('  npm run clear:db   -- Clear all data from database');
    process.exit(0);
}