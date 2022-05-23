router      = require("express").Router();     
const jwt   = require("jsonwebtoken");

require('dotenv').config();

const auth = (req,res,next)=>{
    try{
        let token = req.header("token")
        if(!token){
            return res.status(400).json({status: "failed", message: "not autharised"})
        }
        const decode = jwt.verify(token, process.env.JWT_KEY)
        console.log("decode", decode)
        next();
    }catch(err){
        console.log(err.message)
        return res.status(500).json({status: "failed", message: "token invalid"})
    }
}

module.exports = auth;