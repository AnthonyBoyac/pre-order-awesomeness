const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient
const stripe = require("stripe")('sk_test_51K4YVHA7yzw6bn20KsLI2TWCyjaLjpYDbLdhSLPU0dp2YVqy1O0Sve19IbWmA15guT0PT4EV8YH070YHMAOINpPV003w8HHYbT');
var user_email = "example@gmail.com";
app.use(express.static("public"));
app.use(express.json());

MongoClient.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false', { useUnifiedTopology: true })
  .then(client => {
    app.set('view engine', 'ejs')
    console.log('Connected to Database')
    const db = client.db('orders')
    const dbCollection = db.collection('orders')
    app.use(bodyParser.urlencoded({ extended: true }))

    app.get('/', (req, res) => {
      db.collection('products').find().toArray().then(results => {
        res.render('index.ejs', { products: results })
      }).catch(error => console.error(error))
    })

    const calculateOrderAmount = (items) => {
      var totalPrice = 0;
      for (var i = 0; i < items.length; i++) {
        totalPrice += items[i].price;
      }
      return totalPrice;
    };
    
    app.post("/create-payment-intent", async (req, res) => {
      const { items } = req.body
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: user_email,
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
      res.redirect('/')
    });

    app.listen(3000, function() {
      console.log('listening on 3000')
    })
  })
  .catch(error => console.error(error))

