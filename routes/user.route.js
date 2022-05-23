const router        = require("express").Router();
const bcrypt        = require("bcrypt");
const jwt           = require("jsonwebtoken");
const moment        = require("moment");

const userSchema    = require("../models/user");
const joiSchema     = require("../validation/joi");
const mail          = require("../middleware/mail");

//REGISTER
router.post("/register", async (req, res, next)=>{
    try{
        const userName = req.body.userName;
        const eMail = req.body.eMail;
        const mobileNo = req.body.mobileNo;
        const passWord = req.body.passWord;

        if(userName && eMail && mobileNo && passWord){
            let userNameFind = await userSchema.findOne({'userName': userName}).exec()
            let eMailFind= await userSchema.findOne({'eMail': eMail}).exec()
            let mobileNoFind = await userSchema.findOne({'mobileNo': mobileNo}).exec()

            const userDetails = await (req, res)
            if(userNameFind){
                return res.json({status: "failure", message: 'userName already exist'})
            }else
                if(eMailFind){
                    return res.json({status: "failure", message: 'eMail already exist'})
                }else
                    if(mobileNoFind){
                        return res.json({status: "failure", message: 'mobileNo already exist'})
                    }else{}
            
            let newUser = new userSchema (req.body);
            let salt = await bcrypt.genSalt(10);
            newUser.passWord = bcrypt.hashSync(passWord, salt);
            console.log(newUser.passWord);
            let regUserDetails = await newUser.save();

         
            let mailData = {
                from    : 'ajay.platosys@gmail.com',
                to      : eMail,
                subject : "verify mail",
                fileName: 'verifyMail.ejs',
                details : {
                    eMail:eMail
                }
            }
            let data = mail.mailsending(mailData);
            console.log("data:", data);
            return (res.status(200).json({status: "success", message: "email send and user registerd sucessfully", data: regUserDetails}))
            console.log("email send sucessfully")


            // const subject = req.body.subject;
            // const text = req.body.text;
        
            // const mailData = {
            //     from    : 'ajay.platosys@gmail.com',
            //     to      : eMail,
            //     subject : subject,
            //     text    : text,
            //     file    : 'verifyMail.ejs',
            //     details : {
            //         eMail:user.eMail
            //     }
            // };
            // sgMail.send(mailData)
            //       .then (res.status(200).json({status: "success", message: "email send and user registerd sucessfully", data: regUserDetails}))
            //             console.log("email send sucessfully")
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).json({status: "failure", message: err.message})
    }
});

router.get("/get", async (req, res)=>{
    try{
        console.log("test link!");
    }catch{}
})

//EMAIL VERIFICATION
router.get("/verify-mail/:eMail", async (req, res)=>{
    try{
        const userDetails = await userSchema.findOneAndUpdate({eMail: req.params.eMail}, {verfiedUser:true}, {new:true}).exec();
        return res.status(200).json({status: "success", message: "email id verfication successfull", data: userDetails.verfiedUser});
    }catch(err){
        console.log(err.message);
        return res.status(500).json({status: "failure", message: err.message});
    }    
})

//LOGIN
router.post("/login", async (req, res)=>{
    try{
        const userName=req.body.userName;
        const passWord = req.body.passWord;
        let date = moment().toDate()
        console.log(date)

        let userDetails;
        let details = await userSchema.findOne({'userName': userName}).select('-userName -_id ').exec()

        if(userName){
            userDetails = await userSchema.findOne({'userName': userName}).exec()
            if(!userName){
                return res.status(400).json({status: "failure", message: "user not found"});
            }else
                if(userDetails){
                    let match = await bcrypt.compare(passWord, userDetails.passWord);
                    console.log("passWord match found")
                    await userSchema.findOneAndUpdate({userName: req.body.userName}, {lastedVisited: date,loginStatus: true}, {new:true}).exec()
                    return res.status(200).json({status: "success", message: "Login successfull"})
                    console.log(userDetails);
                }else{}
        }else{}
    }catch(err){
        console.log(err.message);
        return res.status(500).json({status: "failure", message: err.message})
    }
})

//LOGOUT                                                                        
router.post("/logout",async(req,res)=>{
    try{

        let date = moment().toDate()
        console.log(date)
        await userSchema.findOneAndUpdate({uuid: req.query.uuid}, {lastedVisited: date,loginStatus: false}, {new:true}).exec()
        return res.status(200).json({status: "success", message: "Logout success"}) 
    }catch(error){
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})

module.exports = router;