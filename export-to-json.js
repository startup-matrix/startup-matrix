/**
 * Created by http://github.com/siman on 2017-02-06.
 */

let fs = require('fs');
let tactics = require('./tactics');
let S = require('underscore.string');

let tacticToMarketsMap = {};
tactics.forEach(function(tactic) {
  tacticToMarketsMap[tactic] = {};
});

let marketToTacticsMap = {};
let markets = [];
let startups = [];

let csv = require("fast-csv");
csv
  .fromPath(
    "./b2c-original.csv", {
    headers: true,
    //ignoreEmpty: true,
    trim: true
  })
  .on("data", function(data){
    console.log(data);

    let market = data['MARKET'];
    markets.push(market);
    marketToTacticsMap[market] = {};

    tactics.forEach(function(tactic) {
      let startupStr = data[tactic];
      if (!S.isBlank(startupStr)) {

        let parsedStartup = startupStr.match(/\[!\[(.+)]\((.+)\)]\((.+)\)/);
        let startup = {
          brand: parsedStartup[1],
          site: parsedStartup[3],
          logo: parsedStartup[2]
        };

        marketToTacticsMap[market][tactic] = startup;
        tacticToMarketsMap[tactic][market] = startup;

        let startupWithMetrics = Object.assign({}, startup);
        startupWithMetrics.markets = [ market ];
        startupWithMetrics.tactics = [ tactic ];
        startups.push(startupWithMetrics);
      }
    });
  })
  .on("end", function(){
    console.log("\n!! Done !!\n");
    console.log("\nJSON:\n");
    console.log(tacticToMarketsMap);

    fs.writeFileSync('./json/markets.json', JSON.stringify(markets, null, 2));
    fs.writeFileSync('./json/startups.json', JSON.stringify(startups, null, 2));
    fs.writeFileSync('./json/tactic-to-markets.json', JSON.stringify(tacticToMarketsMap, null, 2));
    fs.writeFileSync('./json/market-to-tactics.json', JSON.stringify(marketToTacticsMap, null, 2));
  });