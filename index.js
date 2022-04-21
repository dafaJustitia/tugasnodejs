//import
const express = require ('express');
const cors = require ('cors');

//implementasi
const app = express();
app.use(cors());

//endpopint admin
const admin = require('./routes/admin')
app.use("/admin",admin)

//customer
const customer = require('./routes/customer')
app.use("/customer",customer)

//product
const product = require('./routes/product');
app.use("/product", product)

//transaksi
const transaksi = require('./routes/transaksi');
app.use("/transaksi", transaksi)

app.listen(8080, () => {
    console.log ('server run on port 8080')
})