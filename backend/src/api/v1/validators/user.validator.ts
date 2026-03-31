const Joi = require('joi');

export const updateProfileValidator = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  currentPassword: Joi.string().min(6).optional().messages({
    'string.min': 'Current password must be at least 6 characters long'
  }),
  newPassword: Joi.string().min(6).optional().messages({
    'string.min': 'New password must be at least 6 characters long'
  })
}).with('newPassword', 'currentPassword'); // Require currentPassword if newPassword is provided

export const createUserValidator = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  role: Joi.string().valid('farmer', 'collector', 'admin', 'factory_manager').required().messages({
    'any.only': 'Role must be one of: farmer, collector, admin, factory_manager',
    'string.empty': 'Role is required'
  }),
  farmerProfile: Joi.when('role', {
    is: 'farmer',
    then: Joi.object({
      location: Joi.object({
        county: Joi.string().required().messages({
          'string.empty': 'County is required for farmers'
        }),
        subCounty: Joi.string().required().messages({
          'string.empty': 'Sub-county is required for farmers'
        }),
        ward: Joi.string().required().messages({
          'string.empty': 'Ward is required for farmers'
        }),
        village: Joi.string().required().messages({
          'string.empty': 'Village is required for farmers'
        }),
        coordinates: Joi.object({
          lat: Joi.number().min(-90).max(90).required().messages({
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
            'number.base': 'Latitude must be a number'
          }),
          lng: Joi.number().min(-180).max(180).required().messages({
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
            'number.base': 'Longitude must be a number'
          })
        }).optional()
      }).required(),
      farmSize: Joi.number().min(0.1).max(1000).required().messages({
        'number.min': 'Farm size must be at least 0.1 acres',
        'number.max': 'Farm size cannot exceed 1000 acres',
        'number.base': 'Farm size must be a number'
      }),
      teaVariety: Joi.string().required().messages({
        'string.empty': 'Tea variety is required for farmers'
      })
    }).required(),
    otherwise: Joi.forbidden()
  }),
  collectorProfile: Joi.when('role', {
    is: 'collector',
    then: Joi.object({
      assignedArea: Joi.object({
        county: Joi.string().required().messages({
          'string.empty': 'County is required for collectors'
        }),
        subCounty: Joi.string().required().messages({
          'string.empty': 'Sub-county is required for collectors'
        }),
        wards: Joi.array().items(Joi.string()).min(1).required().messages({
          'array.min': 'At least one ward is required for collectors',
          'array.base': 'Wards must be an array of strings'
        })
      }).required(),
      vehicleDetails: Joi.object({
        type: Joi.string().required().messages({
          'string.empty': 'Vehicle type is required'
        }),
        registration: Joi.string().required().messages({
          'string.empty': 'Vehicle registration is required'
        }),
        capacity: Joi.number().min(100).max(5000).required().messages({
          'number.min': 'Vehicle capacity must be at least 100 kg',
          'number.max': 'Vehicle capacity cannot exceed 5000 kg',
          'number.base': 'Vehicle capacity must be a number'
        })
      }).optional()
    }).required(),
    otherwise: Joi.forbidden()
  })
});

export const updateUserValidator = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  role: Joi.string().valid('farmer', 'collector', 'admin', 'factory_manager').optional().messages({
    'any.only': 'Role must be one of: farmer, collector, admin, factory_manager'
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const changePasswordValidator = Joi.object({
  currentPassword: Joi.string().min(6).required().messages({
    'string.empty': 'Current password is required',
    'string.min': 'Current password must be at least 6 characters long'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters long'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password must match new password',
    'string.empty': 'Confirm password is required'
  })
});

export const userIdValidator = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'User ID must be a valid hexadecimal string',
    'string.length': 'User ID must be 24 characters long',
    'string.empty': 'User ID is required'
  })
});

export const userQueryValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'Page must be at least 1',
    'number.base': 'Page must be a number'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
    'number.base': 'Limit must be a number'
  }),
  role: Joi.string().valid('farmer', 'collector', 'admin', 'factory_manager').optional().messages({
    'any.only': 'Role must be one of: farmer, collector, admin, factory_manager'
  }),
  search: Joi.string().max(100).optional().messages({
    'string.max': 'Search query cannot exceed 100 characters'
  }),
  status: Joi.string().valid('active', 'inactive').optional().messages({
    'any.only': 'Status must be either active or inactive'
  })
});