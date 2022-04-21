//import express
const express = require("express") //engine endpoint
const app = express(); //implementasi
app.use(express.json()) //read only

//import md5
const md5 = require("md5") //enkripsi

//import multer
const multer = require("multer")
const path = require("path")
const fs = require("fs")

//import multer
const models = require("../models/index")
const customer = models.customer

//import auth
const auth = require("../auth")
const jwt = require("jsonwebtoken");
const { post } = require('./product');
const SECRET_KEY = "gondanglegiPride"

//config storage image
const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,"./image/customer")
    },
    filename: (req,file,cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

//Get All Customer, method:get, function: findAll
app.get("/", auth, (req, res) =>{
    customer.findAll()
        .then(result => {
            res.json({
                customer: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })  
})

app.get("/:customer_id", auth, (req, res) =>{
    customer.findOne({ where: {customer_id: req.params.customer_id}})
    .then(result => {
        res.json({
            customer: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

app.post("/", upload.single("image"), auth, (req, res) =>{
    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            image: req.file.filename,
            username: req.body.username,
            password: md5(req.body.password)
        }
        customer.create(data)
        .then(result => {
            res.json({
                message: "data has been inserted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    }
})

app.put("/:id", upload.single("image"), auth,(req, res) =>{
    let param = { customer_id: req.params.id}
    let data = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        username: req.body.username
    }
    if (req.file) {
        // get data by id
        const row = customer.findOne({where: param})
        .then(result => {
            let oldFileName = result.image
           
            // delete old file
            let dir = path.join(__dirname,"../image/customer",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            console.log(error.message);
        })
 
        // set new filename
        data.image = req.file.filename
    }
 
    if(req.body.password){
        data.password = md5(req.body.password)
    }
 
    customer.update(data, {where: param})
        .then(result => {
            res.json({
                message: "data has been updated",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

app.delete("/:id", async (req, res) =>{
    try {
        let param = { customer_id: req.params.id}
        let result = await customer.findOne({where: param})
        let oldFileName = result.image
           
        // delete old file
        let dir = path.join(__dirname,"../image/customer",oldFileName)
        fs.unlink(dir, err => console.log(err))
 
        // delete data
        customer.destroy({where: param})
        .then(result => {
           
            res.json({
                message: "data has been deleted",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
 
    } catch (error) {
        res.json({
            message: error.message
        })
    }
})

//endpoint login customer, METHOD: POST, function: findone
app.post("/auth", async (req, res) => {
    let data = {
        username : req.body.username,
        password : md5(req.body.password)
    }

    let result = await customer.findOne({where: data})
    if(result) {
        //set payload from data
        let payload = JSON.stringify(result)
        //generate token berdasarkan payload dan SECRET_KEY
        let token = jwt.sign(payload, SECRET_KEY)

        res.json({
            logged: true,
            data: result,
            token: token
        })
    }
    else{
        res.json({
            logged: false,
            message: "Invalid username or password"
        })
    }
})

module.exports = app
