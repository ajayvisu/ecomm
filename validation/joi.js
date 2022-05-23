const joi = require('joi');

//JOISCHEMA
const joiSchema = joi.object({
     userName:joi.string().pattern(new RegExp(/^[A-Za-z]+[0-9]+$/)).min(4).max(20).required(), 
     email:joi.string().pattern(new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)).required(),
     mobileNo:joi.string().length(10).pattern(new RegExp(/^[0-9]+$/)).required(),
     passWord:joi.string().min(6).required(),
});

module.exports = {joiSchema}