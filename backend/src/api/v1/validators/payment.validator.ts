const Joi = require('joi');

export const createPaymentValidator = Joi.object({
  farmer: Joi.string().hex().length(24).required(),
  collections: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  paymentDate: Joi.date().max('now').required(),
  paymentMethod: Joi.string().valid('mpesa', 'bank_transfer', 'cash').required()
});

export const processPaymentValidator = Joi.object({
  status: Joi.string().valid('processing', 'completed', 'failed').required(),
  mpesaReference: Joi.when('status', {
    is: 'completed',
    then: Joi.when('paymentMethod', {
      is: 'mpesa',
      then: Joi.string().required(),
      otherwise: Joi.optional()
    })
  }),
  bankReference: Joi.when('status', {
    is: 'completed',
    then: Joi.when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.string().required(),
      otherwise: Joi.optional()
    })
  }),
  failureReason: Joi.when('status', {
    is: 'failed',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  })
});