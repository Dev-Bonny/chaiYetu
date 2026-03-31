const Joi = require('joi');

export const predictionQueryValidator = Joi.object({
  farmerId: Joi.string().hex().length(24).required(),
  days: Joi.number().min(1).max(365).optional()
});