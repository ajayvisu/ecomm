const router          = require("express").Router();
const cartSchema      = require("../models/cart");

router.post("/kart", async(req, res)=>{

    const {productUuid, name, quantity, price} = req.body;
    const userUuid = req.query.userUuid;
    console.log("user_Uuid:", userUuid);
    let productDetails = req.body.productDetails;
    
    try {
        const existingCart = new cartSchema(req.body);
        let cart = await cartSchema.findOne({userUuid});
        //console.log("cart:", cart);
              
        if (cart) {
            let item = cart.productDetails.findIndex(prod => prod.productUuid == productUuid);
            console.log("Item_available?:", item);
            
            if (item > -1){
            let existingProduct = cart.productDetails[item];
            //console.log("Item_details:", existingProduct);
            existingProduct.quantity = quantity;
            cart.productDetails[item] = existingProduct;
            
            existingProduct.price = price * existingProduct.quantity;
            
            //console.log("cart:", cart);


            // if(existingProduct){Cart.productDetails.findOneAndUpdate({userUuid:req.query.userUuid,"cartItems.product":products},{

            // "$set":{
            //     "productDetails":{
            //         ...req.body.productDetails,
            //         quantity:existingProduct.quantity+req.body.productDetails.quantity,
            //         totalPrice:existingProduct.price+=req.body.productDetails.price 
                    
            //     }
            // }
            // })
            // } else{};

       
            } else {
                cart.productDetails.push({productUuid, name, quantity, price});
                }
                cart = await cart.save();
                return res.status(200).send(cart);
        }else{
            const newCart = await cartSchema.create({
            userUuid,
            productDetails: [{ productUuid, name, quantity, price }]
            });
        
            return res.status(200).json({"message": "new cart created successfully", "result" : newCart});
        }
    }catch(err){
        console.log(err.message);
        res.status(500).json(err);
    }
})

module.exports = router;

