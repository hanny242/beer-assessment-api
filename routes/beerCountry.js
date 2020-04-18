var express = require("express");
var router = express.Router();
var request = require("request");
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const apiKey = process.env.API_KEY;

router.get("/", (req, res) => {
  requestUrl = `https://sandbox-api.brewerydb.com/v2/locations/?key=${apiKey}`;

  request(
    {
      uri: requestUrl,
    },
    function (error, response, body) {
      parsedResponse = JSON.parse(response.body);      

      const countries = Array.from(new Set(parsedResponse.data.map(l => l.countryIsoCode)))
        .map(countryIsoCode => {
            return {
                isoCode: countryIsoCode,
                name: parsedResponse.data.find(l => l.countryIsoCode === countryIsoCode).country.name
            };
        })

      res.json(countries);
    }
  );
});

module.exports = router;
