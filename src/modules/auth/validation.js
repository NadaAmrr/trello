import joi from 'joi';

export const signup = joi.object({
  firstName: joi.string().min(3).max(20),
  lastName: joi.string().min(3).max(10),
  userName: joi.string().alphanum().min(3).max(20).required(),
  email: joi.string().email().required(),
  password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
  cPassword: joi.valid(joi.ref("password")).required(),
  age: joi.number().integer().positive().min(18).max(80),
  phone: joi.string(),
  gender: joi.string().valid('female', 'male'),
}).required()
export const login = joi.object({
  email: joi.string().email({minDomainSegments: 2, maxDomainSegments: 3,tlds:['com' , '.net']}).required(),
  password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
}).required()

export const forgetPassword = joi.object({
  email: joi.string().email({minDomainSegments: 2, maxDomainSegments: 3,tlds:['com' , '.net']}).required(),
}).required()
export const newPassword = joi.object({
  token: joi.required(),
  newPassword: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
  cPassword: joi.valid(joi.ref("newPassword")).required(),
}).required()