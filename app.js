var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var beersRouter = require('./routes/beers');
var countryRouter = require('./routes/beerCountry');
var styleRouter = require('./routes/beerStyle');

var app = express();

//added header because BreweryDB does not support CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/beers', beersRouter);
app.use('/countries', countryRouter);
app.use('/styles', styleRouter);


module.exports = app;
