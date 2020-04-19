var express = require("express");
var router = express.Router();
var request = require("request");
var rp = require("request-promise-native");
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const apiKey = process.env.API_KEY;

router.get("/", async (req, res) => {
  requestUrl = `https://sandbox-api.brewerydb.com/v2/locations/?key=${apiKey}`;

  request(
    {
      uri: requestUrl,
    },
    async (error, response, body) => {
      let parsedResponse = JSON.parse(response.body);

      let countries = Array.from(
        new Set(parsedResponse.data.map((l) => l.countryIsoCode))
      ).map((countryIsoCode) => {
        return {
          isoCode: countryIsoCode,
          name: parsedResponse.data.find(
            (l) => l.countryIsoCode === countryIsoCode
          ).country.name,
          breweryIds: Array.from(
            new Set(
              parsedResponse.data
                .filter((l) => l.countryIsoCode === countryIsoCode)
                .map((l) => l.breweryId)
            )
          ),
        };
      });
      if (req.query.countryCode) {
        countries
          .filter((c) => c.isoCode === req.query.countryCode)[0]
          .breweryIds.forEach((breweryId) => {
            request(
              {
                uri: `https://sandbox-api.brewerydb.com/v2/brewery/${breweryId}/beers/?key=${apiKey}`,
              },
              function (error, response, body) {
                parsedResponse = JSON.parse(response.body);

                beersPerCountry = parsedResponse.data.map(function (beers) {
                  return {
                    id: beers.id,
                    name: beers.name,
                  };
                });

                res.json(beers);
              }
            );
          });
      }

      res.json(countries);
    }
  );
});

module.exports = router;
