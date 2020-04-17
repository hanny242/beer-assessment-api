var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const apiKey = process.env.API_KEY;

router.get('/', (req, res) => {


    requestUrl = `https://sandbox-api.brewerydb.com/v2/beers/?key=${apiKey}`;

    if (req.query.name){
        requestUrl = requestUrl + `&name=${req.query.name}`
    }
    if (req.query.styleId){
        requestUrl = requestUrl + `&styleId=${req.query.styleId}`
    }
    request({
        uri: requestUrl
    }, function (error, response, body) { 
        debugger;
        parsedResponse = JSON.parse(response.body);
        if(parsedResponse.data === undefined){
            res.body = [];
            return;
        }

        beers = parsedResponse.data.map(function(beer) {
            return {            
                id: beer.id,
                name: beer.name,
                styleId: beer.styleId
        }});

        res.json(beers);
    });

    
});

module.exports = router;