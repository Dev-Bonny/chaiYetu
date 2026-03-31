import Joi from 'joi';

export const notificationPreferencesValidator = Joi.object({
  email: Joi.object({
    payment: Joi.boolean(),
    collection: Joi.boolean(),
    system: Joi.boolean(),
    alert: Joi.boolean(),
    prediction: Joi.boolean()
  }),
  push: Joi.object({
    payment: Joi.boolean(),
    collection: Joi.boolean(),
    system: Joi.boolean(),
    alert: Joi.boolean(),
    prediction: Joi.boolean()
  }),
  sms: Joi.object({
    payment: Joi.boolean(),
    collection: Joi.boolean(),
    system: Joi.boolean(),
    alert: Joi.boolean(),
    prediction: Joi.boolean()
  }),
  in_app: Joi.object({
    payment: Joi.boolean(),
    collection: Joi.boolean(),
    system: Joi.boolean(),
    alert: Joi.boolean(),
    prediction: Joi.boolean()
  })
});

export const pushSubscriptionValidator = Joi.object({
  endpoint: Joi.string().required(),
  keys: Joi.object({
    p256dh: Joi.string().required(),
    auth: Joi.string().required()
  }).required()
});