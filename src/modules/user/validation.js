import joi from 'joi';

export const update = joi.object({
  firstName: joi.string().min(3).max(20),
  lastName: joi.string().min(3).max(10),
  userName: joi.string().alphanum().min(3).max(20).required(),
  age: joi.number().integer().positive().min(18).max(80),
  phone: joi.string(),
  gender: joi.string().valid('female', 'male'),
}).required()

export const changePassword = joi.object({
  oldPassword: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
  newPassword: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
  cPassword: joi.valid(joi.ref("newPassword")).required(),
}).required()

export const id = joi.object({
  _id: joi.string().alphanum().required(),
}).required()