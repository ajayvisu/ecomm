const mongoose      = require("mongoose");
const crypto        = require("crypto");

const cartSchema = new mongoose.Schema(
    {
        userUuid: {
            type: mongoose.Schema.Types.String,
            ref: "user"
        },
        productDetails: [
            {
            productUuid: String,
            name: String,
            quantity: Number,
            price: Number
            }
        ],
        totalPrice: {type: Number, default: 0},
        modifiedOn: {type: Date, default: Date.now},
        uuid: {type: String, required: false}
    },
    {timestamps: true}
);
    
cartSchema.pre('save', function(next){
    this.uuid = 'CART-'+crypto.pseudoRandomBytes(5).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
    });

module.exports = mongoose.model('cart', cartSchema);



