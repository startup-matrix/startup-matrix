# Startup Matrix

Matrix visualizes the successful startups regarding the market they operate and what kind of tactic they use to differentiate from other businesses and startups.

Tactics on the X. Markets on the Y.

## View on GitHub

GitHub has a user friendly support for CSV and Markdown formats. So you can check out the matrix right here on GitHub:

* CSV: [csv/b2c-site.csv](./csv/b2c-site.csv)
* Markdown: [markdown/b2c-brand-site.md](./markdown/b2c-brand-site.md)

## Startup JSON

Information about each startup is now enriched with a text name of a brand, and a link to the main site of startup. Here is a sample of few startup JSON objects:

```json
{
    "brand": "Twitch",
    "site": "https://www.twitch.tv/",
    "logo": "https://www-cdn.jtvnw.net/images/twitch_logo3.jpg",
    "market": "Gaming",
    "tactic": "Build a UGC community"
  },
  {
    "brand": "Airbnb",
    "site": "https://www.airbnb.com/",
    "logo": "https://a0.muscache.com/airbnb/static/about/resources/airbnb-logo-293-86cb5a9eea395a8233842fb74a5b59af.png",
    "market": "Travel",
    "tactic": "Create a marketplace"
  }
```

## How to update JSON files?

First you need to install Node.js if not yet.
Then run the next commands in terminal:

```bash
npm i
node export-to-json.js
```

JSON files will be updated in `./json` dir.

## Credits

Credits to [original article](https://medium.com/the-mission/the-startup-idea-matrix-182bf2e6a53a) by Eric Stromberg.
