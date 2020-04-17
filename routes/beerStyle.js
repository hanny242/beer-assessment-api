var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const apiKey = process.env.API_KEY;

router.get('/', (req, res) => {

    requestUrl = `https://sandbox-api.brewerydb.com/v2/styles/?key=${apiKey}`;

    request({
        uri: requestUrl
    }, function (error, response, body) {
        parsedResponse = JSON.parse(response.body);

        styles = parsedResponse.data.map(function(style) {
            return {            
                id: style.id,
                name: style.name,
                description: style.description,
        }});

        res.json(styles);
    });

    
});

module.exports = router;