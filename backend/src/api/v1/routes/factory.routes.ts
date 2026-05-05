import { Router } from 'express';
import {
  getDashboardStats,
  getSystemStats,
  getProductionTrend,
  getWeeklyBreakdown,
  getMonthlyBreakdown,
  getAllDeliveries,
  auditCollection,
  bulkAudit,
  getCollectorPerformance,
  getActiveFarmersSummary,
  getFraudFlags,
  getRevenueForecast,
  getOutputForecast,
  getReportData,
} from '../controllers/factory.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

const factoryAuth = [authMiddleware, authorize(['factory_manager', 'admin'])];

// Dashboard
router.get('/dashboard',    ...factoryAuth, getDashboardStats);
router.get('/system-stats', ...factoryAuth, getSystemStats);

// Production Analytics
router.get('/production/trend',   ...factoryAuth, getProductionTrend);
router.get('/production/weekly',  ...factoryAuth, getWeeklyBreakdown);
router.get('/production/monthly', ...factoryAuth, getMonthlyBreakdown);

// Deliveries & Audit
router.get('/deliveries',               ...factoryAuth, getAllDeliveries);
router.patch('/deliveries/:id/audit',   ...factoryAuth, auditCollection);
router.post('/deliveries/bulk-audit',   ...factoryAuth, bulkAudit);

// People
router.get('/collectors/performance', ...factoryAuth, getCollectorPerformance);
router.get('/farmers/summary',        ...factoryAuth, getActiveFarmersSummary);

// Fraud Detection
router.get('/fraud/flags', ...factoryAuth, getFraudFlags);

// Forecasting
router.get('/forecast/revenue', ...factoryAuth, getRevenueForecast);
router.get('/forecast/output',  ...factoryAuth, getOutputForecast);

// Reports
router.get('/reports', ...factoryAuth, getReportData);

export default router;