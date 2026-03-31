import Payment, { IPayment } from '../models/Payment.model';
import Collection from '../models/Collection.model';
import Farmer from '../models/Farmer.model';
// import User from '../models/User.model'; // Unused import removed
import { Types } from 'mongoose';
import axios from 'axios';
const logger = require('../utils/logger.utils');

interface GetPaymentsParams {
  userRole: string;
  userId: string;
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalPayments: number;
  recentPayments: IPayment[];
  monthlyTrend: { month: string; amount: number }[];
}

class PaymentService {
  // Helper to generate correct YYYYMMDDHHmmss timestamp
  private getMpesaTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
  }

  async createPayment(paymentData: any): Promise<IPayment> {
    const { farmer, collections, paymentDate, paymentMethod } = paymentData;

    // Verify farmer exists
    const farmerDoc = await Farmer.findById(farmer).populate('user');
    if (!farmerDoc) {
      throw new Error('Farmer not found');
    }

    // OPTIMIZED: Get paid collection IDs efficiently
    const paidCollectionIds = await this.getPaidCollectionIds();

    // Verify collections exist and are verified but not paid
    const collectionDocs = await Collection.find({
      _id: { 
        $in: collections,       // Must be in the requested list
        $nin: paidCollectionIds // Must NOT be in the already paid list
      },
      farmer: farmer,
      status: 'verified'
    });
    if (collectionDocs.length !== collections.length) {
      throw new Error('Some collections are invalid, not verified, or already paid');
    }

    const totalAmount = collectionDocs.reduce((sum, collection) => sum + collection.totalAmount, 0);

    const payment = await Payment.create({
      farmer,
      collections,
      totalAmount,
      paymentDate,
      paymentMethod,
      processedBy: paymentData.processedBy,
      status: 'pending'
    });

    await Collection.updateMany(
      { _id: { $in: collections } },
      { $set: { status: 'paid' } }
    );

    // Type casting for populated user access
    const farmerUser = (farmerDoc as any).user; 
    logger.info(`Payment ${payment.paymentId} created for farmer ${farmerUser.firstName}`);

    return payment;
  }

  async getPayments(params: GetPaymentsParams): Promise<{ payments: IPayment[]; total: number; page: number; pages: number }> {
    const { userRole, userId, page, limit, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (userRole === 'farmer') {
      const farmer = await Farmer.findOne({ user: userId });
      if (!farmer) throw new Error('Farmer profile not found');
      query.farmer = farmer._id;
    }

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('farmer')
        .populate('collections')
        .populate('processedBy')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query)
    ]);

    return {
      payments,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getPaymentById(paymentId: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId)
      .populate('farmer')
      .populate('collections')
      .populate('processedBy');

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  async processPayment(paymentId: string, processData: any): Promise<IPayment> {
    const { status, mpesaReference, bankReference, failureReason } = processData;

    const updateData: any = {
      status,
      processedAt: new Date()
    };

    if (status === 'completed') {
      if (processData.paymentMethod === 'mpesa') {
        updateData.mpesaReference = mpesaReference;
      } else if (processData.paymentMethod === 'bank_transfer') {
        updateData.bankReference = bankReference;
      }
    } else if (status === 'failed') {
      updateData.failureReason = failureReason;
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'farmer',
        populate: { path: 'user' } // Nested populate to ensure we get User details for SMS
      })
      .populate('collections')
      .populate('processedBy');

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (status === 'completed') {
      await this.sendPaymentNotification(payment);
    }

    logger.info(`Payment ${payment.paymentId} ${status}`);

    return payment;
  }

  async getFarmerPayments(farmerId: string, page: number, limit: number): Promise<{ payments: IPayment[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ farmer: farmerId })
        .populate('collections')
        .populate('processedBy')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ farmer: farmerId })
    ]);

    return {
      payments,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getPaymentSummary(userId: string, userRole: string, startDate?: string, endDate?: string): Promise<PaymentSummary> {
    const query: any = {};
    const dateFilter: any = {};

    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
    }

    if (userRole === 'farmer') {
      const farmer = await Farmer.findOne({ user: userId });
      if (!farmer) throw new Error('Farmer profile not found');
      query.farmer = farmer._id;
    }

    const [totalPaid, totalPending, recentPayments, monthlyData] = await Promise.all([
      Payment.aggregate([
        { $match: { ...query, ...dateFilter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Payment.aggregate([
        { $match: { ...query, ...dateFilter, status: { $in: ['pending', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Payment.find({ ...query, ...dateFilter })
        .populate('farmer')
        .sort({ paymentDate: -1 })
        .limit(5),
      Payment.aggregate([
        {
          $match: {
            ...query,
            status: 'completed',
            paymentDate: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$paymentDate' },
              month: { $month: '$paymentDate' }
            },
            amount: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ])
    ]);

    const summary: PaymentSummary = {
      totalPaid: totalPaid[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0,
      totalPayments: await Payment.countDocuments({ ...query, ...dateFilter }),
      recentPayments,
      monthlyTrend: monthlyData.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        amount: item.amount
      }))
    };

    return summary;
  }

  async initiateMpesaPayment(paymentId: string, phoneNumber: string): Promise<any> {
    const payment = await Payment.findById(paymentId).populate('farmer');
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new Error('Payment is not in pending status');
    }

    const formattedPhone = phoneNumber.replace(/^0/, '254').replace(/^\+254/, '254');
    
    // FIX 1: Use corrected timestamp logic
    const timestamp = this.getMpesaTimestamp();
    
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Type casting needed here because Mongoose 'populate' doesn't always infer strictly
    const farmerDetails = payment.farmer as any;

    const stkPushPayload = {
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(payment.totalAmount), // M-Pesa doesn't like decimals
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BACKEND_URL}/api/v1/payments/mpesa/callback`,
      AccountReference: `Payment-${payment.paymentId}`,
      // Ensure transaction desc is short and clean
      TransactionDesc: `Tea Pay ${farmerDetails.farmerId || 'Collection'}` 
    };

    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    try {
      const tokenResponse = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: { Authorization: `Basic ${auth}` }
        }
      );

      const stkResponse = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        stkPushPayload,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await Payment.findByIdAndUpdate(paymentId, {
        status: 'processing',
        mpesaReference: stkResponse.data.CheckoutRequestID
      });

      logger.info(`M-Pesa payment initiated for payment ${payment.paymentId}`);

      return {
        checkoutRequestId: stkResponse.data.CheckoutRequestID,
        responseDescription: stkResponse.data.ResponseDescription
      };
    } catch (error: any) {
      logger.error('M-Pesa Initiation Error', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  async handleMpesaCallback(callbackData: any): Promise<void> {
    const { Body: { stkCallback: callback } } = callbackData;

    // Find payment by checkout request ID immediately
    const payment = await Payment.findOne({ mpesaReference: callback.CheckoutRequestID });
    if (!payment) {
      logger.error(`Payment not found for checkout ID: ${callback.CheckoutRequestID}`);
      return;
    }

    if (callback.ResultCode === 0) {
      const metadata = callback.CallbackMetadata?.Item || [];
      const mpesaReceipt = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;

      await this.processPayment(payment._id.toString(), {
        status: 'completed',
        mpesaReference: mpesaReceipt,
        paymentMethod: 'mpesa'
      });
    } else {
      await this.processPayment(payment._id.toString(), {
        status: 'failed',
        failureReason: callback.ResultDesc
      });
    }
  }

  // FIX 2: Optimized to use DB distinct instead of fetching all documents
  private async getPaidCollectionIds(): Promise<Types.ObjectId[]> {
    const paidPayments = await Payment.distinct('collections', { 
      status: { $ne: 'failed' } 
    });
    return paidPayments;
  }

  private async sendPaymentNotification(payment: IPayment): Promise<void> {
    try {
      // Ensure we have the user details
      const farmer = await Farmer.findById(payment.farmer).populate('user');
      if (!farmer) return;

      const user = (farmer as any).user;
      const message = `Hello ${user.firstName}, your payment of KES ${payment.totalAmount} for tea collections has been processed. Ref: ${payment.paymentId}`;

      logger.info(`SMS notification: ${message} to ${user.phone}`);
    } catch (error) {
      logger.error('Failed to send payment notification:', error);
    }
  }
}

export default new PaymentService();