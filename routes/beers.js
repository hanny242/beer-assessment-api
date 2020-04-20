var express = require("express");
var router = express.Router();
var request = require("request");
var rp = require("request-promise-native");
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const apiKey = process.env.API_KEY;

//get request for beers, beer search, beer style, and beer country
router.get("/", async (req, res) => {
  if (!req.query.page) {
    req.query.page = 1;
  }
  requestUrl = `https://sandbox-api.brewerydb.com/v2/beers/?key=${apiKey}&p=${req.query.page}`;

  let breweryIds = null;

  if (req.query.name) {
    requestUrl = `https://sandbox-api.brewerydb.com/v2/search/?key=${apiKey}&q=${req.query.name}&type=beer`;
  }
  if (req.query.styleId) {
    requestUrl = requestUrl + `&styleId=${req.query.styleId}`;
  }

  //get breweryIds from locations with certain countryCode
  if (req.query.countryCode) {
    request(
      {
        uri: `https://sandbox-api.brewerydb.com/v2/locations/?key=${apiKey}&countryIsoCode=${req.query.countryCode}`,
      },
      async function (error, response, body) {
        parsedResponse = JSON.parse(response.body);
        if (parsedResponse.data === undefined) {
          breweryIds = [];
          return;
        }
        // Make distinct array of breweryIds
        breweryIds = [...new Set(parsedResponse.data.map((l) => l.breweryId))];
        debugger;
        // TODO: Handle pages for country
        beers = await getBeersFromBreweries(breweryIds, req.query.page);
        debugger;

        res.json(beers);
      }
    );

    return;
  }
  request(
    {
      uri: requestUrl,
    },
    function (error, response, body) {
      parsedResponse = JSON.parse(response.body);

      if (parsedResponse.data === undefined) {
        res.body = [];
        return;
      }

      beers = mapBeers(parsedResponse.data);

      res.json(beers);
    }
  );
});

function mapBeers(data) {
  return data.map((beer) => {
    return {
      id: beer.id,
      name: beer.name,
      styleId: beer.styleId,
    };
  });
}

async function getBeersFromBreweries(breweryIds, pageNumber) {
  let result = [];
  const pageSize = 50;
  const maxSearchCount = pageNumber * pageSize;
  debugger;
  const map = new Map();
  for (const breweryId of breweryIds) {
    await rp(
      `https://sandbox-api.brewerydb.com/v2/brewery/${breweryId}/beers/?key=${apiKey}`
    ).then(async (body) => {
      let parsedResponse = JSON.parse(body);

      for (const beer of parsedResponse.data) {
        if (!map.has(beer.id)) {
          map.set(beer.id, true);
          result.push({
            id: beer.id,
            name: beer.name,
          });
        }
        if (result.length >= maxSearchCount) {
          debugger;
          if (pageNumber > 1) {
            result.splice(0, maxSearchCount - pageSize);
          }
          break;
        }
      }
    });
    if (result.length >= maxSearchCount) {
      debugger;
      // Remove all the elements in the array except the page we are on
      break;
    }
  }

  return result;
}

module.exports = router;
