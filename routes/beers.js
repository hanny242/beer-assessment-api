var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const apiKey = process.env.API_KEY;

router.get('/', (req, res) => {
    requestUrl = `https://sandbox-api.brewerydb.com/v2/beers/?key=${apiKey}`;

    let breweryIds = null;

    if (req.query.name) {
        requestUrl = requestUrl + `&name=${req.query.name}`
    }
    if (req.query.styleId) {
        requestUrl = requestUrl + `&styleId=${req.query.styleId}`
    }
    if (req.query.countryCode) {
        request({
            uri: `https://sandbox-api.brewerydb.com/v2/locations/?key=${apiKey}&countryIsoCode=${req.query.countryCode}`
        }, function (error, response, body) { 
            debugger;
            parsedResponse = JSON.parse(response.body);
            if(parsedResponse.data === undefined){
                breweryIds = [];
                return;
            }
            
            // Make distinct array of breweryIds
            breweryIds = [...new Set(parsedResponse.data.map(l => l.breweryId))];
    
        });    

        requestUrl = requestUrl + '&withBreweries=Y';
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

        if (breweryIds) {
            parsedResponse.data = parsedResponse.data.filter(beer => {
                return beer.breweries.filter(brewery => breweryIds.includes(brewery.id)).length > 0
            })
        }

        beers = mapBeers(parsedResponse.data)

        res.json(beers);
    });    
});

function mapBeers(data) {
    return data.map(beer => {
        return {            
            id: beer.id,
            name: beer.name,
            styleId: beer.styleId
    }});
}

module.exports = router;