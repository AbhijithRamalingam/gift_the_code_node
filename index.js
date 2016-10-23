var express = require('express');
var _ = require('lodash');
var moment = require('moment');
var bodyParser = require('body-parser')
var cors = require('cors');
var mongoose = require('mongoose');

var app = express();

const transactions = require("./data/transactions").data
const Trxn = require('./models/trxn_model');

const dateFormat = "YYYY-MM-DD"

mongoose.connect("52.205.251.79:27017/budget");

app.use(cors());
app.use(bodyParser.json({type:'*/*'}));

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  Trxn.find({}, function(err, transactions){
    response.send(transactions);
  });

  // response.render('pages/index');
  // response.send("Hello Kangze");
});

app.get('/transactions', function(request, response) {
  console.log("Hit the transactions route")
  console.log(request.query)
  let filter_object = {
    user_id: request.query.userId,
  }
  // Allow for category wide search
  if(request.query.category){
    filter_object["category"] = request.query.category
  }
  // Allow for subcategory search
  if(request.query.category && request.query.subcategory){
    filter_object["subcategory"] = request.query.subcategory
  }

  var user_transactions = _.filter(transactions, filter_object);

  if(request.query.fromDate && request.query.toDate){
    fromDate = moment(request.query.fromDate, dateFormat);
    toDate = moment(request.query.toDate, dateFormat);

    user_transactions = _.filter(user_transactions, function(transaction){
      return moment(transaction.date).isBetween(fromDate, toDate);
    });
  }
  response.json(user_transactions);
});

app.get('/users/:userId', function(request, response){
  let filter_object = {
    _id: request.params.userId
  }
  response.json({
    user_id: "foobar",
    is_onboarded: true,
    current_balance: 100,
    sign_up_date: new Date(),
    categories: [
      {category_id: "3sifjsf", category_name: "Living Expenses", subcategories: ["rent", "insurance", "food"]},
      {category_id: "asdfyul", category_name: "Transportation", subcategories: ["public transit", "taxi"]},
      {category_id: "asdkfhd", category_name: "Leisure", subcategories: ["gifts", "alcohol"]}
    ]
  })
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port ', app.get('port'));
});
