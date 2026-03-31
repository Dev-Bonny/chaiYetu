const Joi = require('joi');

export const registerValidator = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('farmer', 'collector', 'admin', 'factory_manager').required(),
  farmerProfile: Joi.when('role', {
    is: 'farmer',
    then: Joi.object({
      location: Joi.object({
        county: Joi.string().required(),
        subCounty: Joi.string().required(),
        ward: Joi.string().required(),
        village: Joi.string().required(),
        coordinates: Joi.object({
          lat: Joi.number().required(),
          lng: Joi.number().required()
        }).optional()
      }).required(),
      farmSize: Joi.number().min(0).required(),
      teaVariety: Joi.string().required()
    }).required(),
    otherwise: Joi.forbidden()
  }),
  collectorProfile: Joi.when('role', {
    is: 'collector',
    then: Joi.object({
      assignedArea: Joi.object({
        county: Joi.string().required(),
        subCounty: Joi.string().required(),
        wards: Joi.array().items(Joi.string()).min(1).required()
      }).required(),
      vehicleDetails: Joi.object({
        type: Joi.string().required(),
        registration: Joi.string().required(),
        capacity: Joi.number().min(0).required()
      }).optional()
    }).required(),
    otherwise: Joi.forbidden()
  })
});

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordValidator = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});