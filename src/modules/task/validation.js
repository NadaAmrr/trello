import joi from 'joi';

export const addTask = joi.object({
  title: joi.string().min(3).required(),
  description: joi.string().max(250).required(),
  status: joi.string().valid('toDo', 'doing', 'done'),
  assignTo: joi.string().alphanum().required(),
  deadline: joi.date().greater('now').required(),
}).required()
//updateTask
export const updateTask = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  status: joi.string().valid('toDo', 'doing', 'done').required(),
  taskId: joi.string().alphanum().required(),
  assignTo: joi.string().required(),
  deadline: joi.date().greater('now').required(),
}).required()
//deleteTask
export const deleteTask = joi.object({
  taskId: joi.string().alphanum().required(),
}).required()
//id
export const id = joi.object({
  id: joi.string().alphanum().required(),
}).required()