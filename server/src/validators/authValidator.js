const Joi = require("joi");

const registerSchema = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().min(5).required()
})

const loginSchema = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().min(1).required()
})

module.exports = {registerSchema, loginSchema}