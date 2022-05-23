const router            = require("express").Router();
const multer            = require("multer");
const xlsx              = require("xlsx");
const path              = require("path");

const productSchema     = require("../models/product");
const userSchema        = require("../models/user");
const authVerfy         = require("./auth.route");
const adminVerfy        = require("./auth.route");
const storageMulter     = require("../middleware/multer");

const upload            = multer({storage: storageMulter.storage})

//CREATE PRODUCT
router.post("/add", async (req, res)=>{
    try{
        const newProduct = new productSchema(req.body);
        console.log(newProduct);
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);

    }catch(err){
        res.status(500).json(err);
    }
});

//UPDATE PRODUCT
router.put("/update", async(req, res)=>{
    try{
        let condition = {"uuid": req.query.uuid}
        //console.log(req.body.uuid);
        let productDetails = req.body.productDetails;
        console.log("product_detail", productDetails);
        let option = {new: true}

        const updatedProduct = await productSchema.findOneAndUpdate(condition, productDetails, option).exec();
        //console.log(updatedProduct);
        res.status(200).json(updatedProduct);

    }catch(err){
        console.log(err.message);
        res.status(500).json(err);
    }
});

//DELETE PRODUCT
router.delete("/delete", async(req, res)=>{
    try{
        await productSchema.findOneAndDelete({"uuid": req.query.uuid}).exec();
        res.status(200).json("product deleted successfully");

    }catch(err){
        console.log(err.message);
        res.status(500).json(err);
    }
});

//GET ALL PRODUCTS
router.get("/getall", async(req, res)=>{
    try{
        const allProducts = await productSchema.find().exec();
        res.status(200).json({"message": "all products fecthed successfully", "result": allProducts});

    }catch(err){
        console.log(err.message);
        res.status(500).json(err);
    }
});

//GET PRODUCTS BY NAME
router.get("/prod-by-name", async(req, res)=>{
    try{
        const itemByName = await productSchema.findOne({"name":req.body.name}).exec();
        res.status(200).json({"message": "product fecthed successfully", "result": itemByName});
        
    }catch(err){
        console.log(err.message);
        res.status(500).json(err);
    }
});

//FETCH PRODUCTS NAME BY CHARACTERS
router.get("/prod-by-char", async (req, res)=>{
    try{
        let searchProd = {};
        console.log("search_Prod", searchProd);
        if (searchProd){
            searchProd.name = {
                $regex: req.query.name,
                $options: "i"
            }
        }else{}

        let prodByChar = await productSchema.find(searchProd).exec();
        res.status(200).json({"message": "products by character fetched successfully", "result": prodByChar});

    }catch(err){
        console.log(err.message);
        res.status(500).json(err);
    }
});

//FILTER
router.get("/filter", async(req, res)=>{
    try{
        let minPrice = req.query.minPrice;
        let maxPrice = req.query.maxPrice;

        const filteredPrice = await productSchema.aggregate([
            {
                $match:{
                    $and:[
                        {price:{
                            $gte: minPrice,
                            $lte: maxPrice
                        }}
                    ]
                }
            },{
                $sort:{price:1}
            },{
                $project:{
                    "_id":0,
                    "desc":0,
                    "categ":0,
                    "createdAt":0,
                    "updatedAt":0,
                    "uuid":0,
                    "__v":0
                }
            }

        ])
        console.log("filteredPrice", filteredPrice);
        res.status(200).json({"message": "products filtered by price sucessfully", "result": filteredPrice});

    }catch(err){
        console.log(err.message);
        res.status(500).json(err);
    }
})

//AGGREGATE
router.get("/user-based-products", async(req,res) =>{
        try{
            let details = await userSchema.aggregate([
                {
                    $match:{
                        $and:[
                            {"uuid": req.query.uuid},
                        ]
                    }
                },
                {
                    '$lookup':{
                        from:'products',
                        localField: 'uuid',
                        foreignField: 'userUuid',
                        as: 'productDetails'
                        }
                },
                {
                    '$unwind':{
                        path:'$productDetails',
                        preserveNullAndEmptyArrays:true
                        }
                },
                {
                    $project:{
                        "_id": 0,
                        "username": 1,
                        "productDetails.name": 1,
                        }
                },
            ])
            
            console.log(details)
            if(details.length>=1){
                return res.status(200).json({'status': 'success', message: "user based product details fetched sucessfully", 'result': details});
            }else{
                return res.status(404).json({'status': 'failure', message: "product details not found for the user"})
            }
        }catch(error){
            console.log(error.message);
            return res.status(400).json({"status": 'failure', 'message': error.message})
        }
})

//BULKUPLOAD
router.post("/bulk-upload", upload.single('file'), async (req, res)=>{
    try {
        let path = './bulkuploads/' + req.file.filename;
        console.log(path);
        let fileDetails     = xlsx.readFile(path);
        let sheetDetails    = fileDetails.SheetNames;
        let result          = xlsx.utils.sheet_to_json(fileDetails.Sheets[sheetDetails[0]]);
        
        console.log("result:",result);

        for (let data of result) {
            let resultData = await productSchema.findOne({name:data.name})
            if(resultData){
                updateData = await productSchema.findOneAndUpdate({name:data.name}, {new:true})
                }else{
                    const newData = new productSchema(data);
                    const newProductsDetails = await newData.save();
                    console.log("newProductsDetails:", newProductsDetails);
                }
        }
        return res.status(200).json({status: "success", message: "bulk upload successfull"})
    }catch (error) {
        console.log(error);
        return res.status(500).json({status: "failure", message: error.message})
    }
})

module.exports = router;