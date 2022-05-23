const express   = require("express");
const router    = require("express").Router();
const ejs       = require("ejs");
const paypal    = require("paypal-rest-sdk");

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'ARJFd6ihFoJLbfOv2uDNbg5DNBSsOt5WNR-PjrBeIv4_uqf_9LHSgu3oGePyhbvvkxJXbtZvnDOQu499',
  'client_secret': 'EKPPU_ApthXZCfa44rzMLh0DGG_M1_dmePIvG1c0tK-KM5c59ViCkkfs-9Tie4slYKelKxy1KaLZOT1W'
});

const app = express();

//app.set('view engine', 'ejs');

//app.get('/index', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:8000/success",
        "cancel_url": "http://localhost:8000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

module.exports = router;

