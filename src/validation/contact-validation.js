import Joi from "joi";

export const createContactValidation = Joi.object({
   firstName: Joi.string().max(100).required(),
   lastName: Joi.string().max(100).optional(),
   email: Joi.string().max(200).optional().email(),
   phone: Joi.string().max(20).optional()
});

export const updateContactValidation = Joi.object({
   id: Joi.number().positive().required(),
   firstName: Joi.string().max(100).required(),
   lastName: Joi.string().max(100).optional(),
   email: Joi.string().max(200).optional().email(),
   phone: Joi.string().max(20).optional()
}); 

export const searchContactValidation = Joi.object({
   page: Joi.number().min(1).positive().default(1),
   size: Joi.number().min(1).positive().default(10).max(100),
   name: Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional()
   }),
   email: Joi.string().optional(),
   phone: Joi.string().optional()
})

export const getContactValidation = Joi.number().positive().required();
