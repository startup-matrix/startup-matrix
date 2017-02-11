/**
 * Created by http://github.com/siman on 2017-02-11.
 */

let Promise = require('bluebird');
let cheerio = require('cheerio');
let request = require('request');
let moment = require('moment');
let fs = require('fs');

// Data
let startups = require('./json/startups');
//let startups = require('./json/startups-sample');

function $loadHtml(html) {
  // 'decodeEntities = true' is to convert HTML entities like '&amp' to '&', etc.
  return cheerio.load(html, { decodeEntities: true });
}

function parseSiteWithRequest(startup) {
  return new Promise((resolve, reject) => {
    let url = startup.site;
    console.log(`\nRequest site at URL: ${url}`);
    request(
      {
        url: url,
        encoding: 'UTF-8',
        gzip: true,
        headers: {
          pragma: 'no-cache',
          'accept-encoding': 'gzip, deflate',
          'accept-language': 'en-US,en;q=0.8',
          'upgrade-insecure-requests': '1',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'cache-control': 'no-cache',
          authority: 'www.affirm.com',
          cookie: ''
        }
      },
      (error, res, body) => {

        let errorMessage = null;
        if (error) {
          errorMessage = `Error at URL [${url}]: ${error}`;
        } else if (res.statusCode == 200) {
          try {

            startup.siteMeta = parseSiteHtml(url, body);
            console.log(`\nParsed HTML meta of site ${url}:\n`, startup.siteMeta);
            resolve({ ok: true, startup: startup });
            return;

          } catch (ex) {
            errorMessage = ex;
          }
        } else if (res.statusCode == 404) {
          errorMessage = `Page not found at URL [${url}]. HTTP error: ${res.statusCode}`;
        } else if (res.statusCode == 503) {
          errorMessage = `Server error at URL [${url}]. HTTP error: ${res.statusCode}`;
        } else {
          errorMessage = `Unexpected HTTP status code at URL [${url}]. HTTP error: ${res.statusCode}`;
        }

        console.error(errorMessage);

        // TODO Use reject() here? yes
        resolve({ ok: false, error: errorMessage });
      }
    );
  });
}

function parseSiteHtml(url, html) {
  let $ = $loadHtml(html);
  let meta = {
    fb: {},
    og: {}
  };

  setPrettyString(meta, 'title',          () => $('title').text() );
  setPrettyString(meta, 'description',    () => $('meta[name="description"]').attr('content') );
  setPrettyString(meta, 'author',         () => $('meta[name="author"]').attr('content') );

  setPrettyString(meta.og, 'title',       () => $('meta[property="og:title"]').attr('content') );
  setPrettyString(meta.og, 'description', () => $('meta[property="og:description"]').attr('content') );
  setPrettyString(meta.og, 'image',       () => $('meta[property="og:image"]').attr('content') );
  setPrettyString(meta.og, 'type',        () => $('meta[property="og:type"]').attr('content') );
  setPrettyString(meta.og, 'url',         () => $('meta[property="og:url"]').attr('content') );

  setPrettyString(meta.fb, 'appId',       () => $('meta[property="fb:app_id"]').attr('content') );

  let kws = getPrettyString(() => $('meta[name="keywords"]').attr('content') );
  if (typeof kws !== 'undefined' && kws.length > 0) {
    meta.keywords = kws.split(',').map(kw => getPrettyString(() => kw));
  }

  deleteEmptyKeys(meta);

  return meta;
}

function deleteEmptyKeys(obj) {
  Object.keys(obj).forEach(k => {
    let v = obj[k];
    if (typeof v === 'object' && Object.keys(v).length === 0) {
      delete obj[k];
    }
  });
}

function getPrettyString(getStringFn) {
  let prettyVal;
  try {
    let value = getStringFn();
    if (value !== null && typeof value === 'string') {
      prettyVal = value.
        replace(/(\n|\r|\r\n)+/, ' ').
        replace(/[ ]+/, ' ').
        trim()
      ;
      if (prettyVal === '') {
        prettyVal = undefined;
      }
    }
  } catch (e) {}
  return prettyVal;
}

function setPrettyString(obj, propName, getValueFn) {
  let value = getPrettyString(getValueFn);
  if (typeof value !== 'undefined') {
    obj[propName] = value;
  }
}

function main() {
  const startM = moment();
  const printTiming = () => { printElapsedTime(startM); };
  const parseSitePromises = startups.map(s => parseSiteWithRequest(s));

  Promise.all(parseSitePromises)
    .then(results => {
      fs.writeFileSync(`./json/startups-with-html-meta.json`, JSON.stringify(startups, null, 2));
      printTiming();
    })
    .catch(err => {
      console.log(`Parsing promises failed with an error: ${err}`);
      printTiming();
    });
}

function printElapsedTime(startMoment) {
  const finishMoment = moment();
  console.log(`Script started at: ${startMoment.format()}`);
  console.log(`Script finished at: ${finishMoment.format()}`);
}

main();