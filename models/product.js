const mongoose      = require("mongoose");
const crypto        = require("crypto");

const productSchema = new mongoose.Schema(
    {
    uuid: {type: String, required: false},
    name: {type: String, required: true, unique: true},
    desc: {type: String, required: true},
    price: {type: String, required: true},
    categ: {type: String, required: true},
    userUuid: {type: String, required: false}
    }, 
    {timestamps: true}
);

productSchema.pre('save', function(next){
    this.uuid = 'PROD-'+crypto.pseudoRandomBytes(5).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
});  

module.exports = mongoose.model('product', productSchema);