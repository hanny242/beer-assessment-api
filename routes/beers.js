var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const apiKey = process.env.API_KEY;


//get request for beers, beer search, beer style, and beer country
router.get('/', (req, res) => {
    requestUrl = `https://sandbox-api.brewerydb.com/v2/beers/?key=${apiKey}p=${req.query.page}`;

    let breweryIds = null;

    if (req.query.name) {
        requestUrl = requestUrl + `&name=${req.query.name}`
    }
    if (req.query.styleId) {
        requestUrl = requestUrl + `&styleId=${req.query.styleId}`
    }

    //get breweryIds from locations with certain countryCode
    if (req.query.countryCode) {
        request({
            uri: `https://sandbox-api.brewerydb.com/v2/locations/?key=${apiKey}&countryIsoCode=${req.query.countryCode}`
        }, function (error, response, body) {
            parsedResponse = JSON.parse(response.body);
            if(parsedResponse.data === undefined){
                breweryIds = [];
                return;
            }
            debugger;
            // Make distinct array of breweryIds
            breweryIds = [...new Set(parsedResponse.data.map(l => l.breweryId))];
    
        });    

        requestUrl = requestUrl + '&withBreweries=Y';
    }
    request({
        uri: requestUrl
    }, function (error, response, body) {
        parsedResponse = JSON.parse(response.body);


        debugger;

        if(parsedResponse.data === undefined){
            res.body = [];
            return;
        }

        //get beers from breweries with certain countryCode

        if (breweryIds) {
            parsedResponse.data = parsedResponse.data.filter(beer => {
                debugger;
                return beer.breweries.filter(brewery => breweryIds.includes(brewery.id)).length > 0
            })
        }

        beers = mapBeers(parsedResponse.data)
        const numberOfPages = parsedResponse.numberOfPages;



        res.json({
            beers,
            numberOfPages
        });
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