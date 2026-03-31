const Joi = require('joi');

export const createCollectionValidator = Joi.object({
  farmer: Joi.string().hex().length(24).required(),
  collectionDate: Joi.date().max('now').required(),
  weight: Joi.number().min(0.1).max(1000).required(), // kg
  quality: Joi.string().valid('grade1', 'grade2', 'grade3').required(),
  location: Joi.object({
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    address: Joi.string().required()
  }).required(),
  notes: Joi.string().max(500).allow('').optional()
});

export const updateCollectionValidator = Joi.object({
  weight: Joi.number().min(0.1).max(1000).optional(),
  quality: Joi.string().valid('grade1', 'grade2', 'grade3').optional(),
  location: Joi.object({
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    address: Joi.string().required()
  }).optional(),
  notes: Joi.string().max(500).allow('').optional()
});