import Farmer, { IFarmer } from '../models/Farmer.model';
import Collector from '../models/Collector.model';
import User from '../models/User.model';

class FarmerService {
    async getFarmers(params: {
        page?: number;
        limit?: number;
        search?: string;
        county?: string;
        status?: string;
    }) {
        const { page = 1, limit = 10, search, county, status } = params;
        const skip = (page - 1) * limit;

        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (county && county !== 'all') {
            query['location.county'] = county;
        }

        // Since name/email/phone are in the referenced User model, searching is tricky with standard find()
        // unless we use aggregation or search strictly on Farmer fields. 
        // For simplicity, we'll fetch then filter or search by farmerId which is on the model.
        if (search) {
            query.farmerId = { $regex: search, $options: 'i' };
        }

        const [farmers, total] = await Promise.all([
            Farmer.find(query)
                .populate('user', 'firstName lastName email phone role isActive')
                .populate('collector')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Farmer.countDocuments(query)
        ]);

        return {
            farmers,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }

    async getAssignedFarmers(collectorUserId: string) {
        const collector = await Collector.findOne({ user: collectorUserId });

        if (!collector) {
            throw new Error('Collector profile not found');
        }

        const farmers = await Farmer.find({ collector: collector._id })
            .populate('user', 'firstName lastName email phone role isActive')
            .sort({ createdAt: -1 });

        return {
            farmers,
            total: farmers.length
        };
    }
    async createFarmer(farmerData: any, creatorUserId?: string) {
        // 1. Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email: farmerData.email }, { phone: farmerData.phone }]
        });

        if (existingUser) {
            throw new Error('User with this email or phone already exists');
        }

        // 2. Create User account
        // Default password to phone number or a standard default
        const defaultPassword = farmerData.phone || 'Password123!';

        const user = await User.create({
            firstName: farmerData.firstName,
            lastName: farmerData.lastName,
            email: farmerData.email,
            phone: farmerData.phone,
            role: 'farmer',
            password: defaultPassword,
            isActive: true
        });

        // 3. Determine Collector
        let collectorId = undefined;
        if (creatorUserId) {
            // Check if creator is a collector
            const creatorCollector = await Collector.findOne({ user: creatorUserId });
            if (creatorCollector) {
                collectorId = creatorCollector._id;
            }
        }

        // 4. Create Farmer Profile
        const farmer = await Farmer.create({
            user: user._id,
            location: farmerData.location,
            farmSize: farmerData.farmSize,
            teaVariety: farmerData.teaVariety,
            collector: collectorId,
            status: 'active'
        });

        return farmer;
    }
}

export default new FarmerService();
