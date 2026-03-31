import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit auth attempts
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const predictionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit prediction requests
  message: {
    success: false,
    message: 'Too many prediction requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit payment requests
  message: {
    success: false,
    message: 'Too many payment requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});