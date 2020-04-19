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

      let countriesWithBreweries = Array.from(
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

      countriesWithBreweries = await getCountriesWithBeers(countriesWithBreweries);
      debugger;
      const countries = countriesWithBreweries.map((c) => {
        return {
          isoCode: c.isoCode,
          name: c.name,
        };
      });
      res.json(countries);
    }
  );
});

const asyncFilter = async (arr, predicate) => {
	const results = await Promise.all(arr.map(predicate));

	return arr.filter((_v, index) => results[index]);
}

async function getCountriesWithBeers(countriesWithBreweries) {
  return await asyncFilter(countriesWithBreweries, async (c) => {
    let countryHasBeers = false;
    for (const breweryId of c.breweryIds) {
      if (countryHasBeers) {
        break;
      }

      await rp(
        `https://sandbox-api.brewerydb.com/v2/brewery/${breweryId}/beers/?key=${apiKey}`
      ).then(async (body) => {
        let parsedResponse = JSON.parse(body);
        countryHasBeers = parsedResponse.data.length > 1;
      });
    }
    debugger;
    return countryHasBeers;
  });
}

module.exports = router;
