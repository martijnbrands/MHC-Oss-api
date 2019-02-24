const express = require("express");
const Cors = require("cors");
const Xray = require("x-ray");
const app = express();

const x = Xray({
  filters: {
    cleanUpText: function (value) {
      return value.replace(/(\r\n|\n|\r)/gm, "");
    },
    cleanUpDate: function (value) {
      return value.replace(/\s/g, '')
    },
    cleanNames: function (value) {

      return value
        .split("(")
        .pop()
        .split(")")[0];
    },
    urlSplit: function (value) {
      return value
        .split("_")
        .pop()
        .split("&")[0];
    },
    trim: function (value) {
      return typeof value === "string" ? value.trim() : value;
    },
    slice: function (value, start, end) {
      return typeof value === "string" ? value.slice(start, end) : value;
    },
    static: function (value, svalue) {
      return svalue + value;
    }
  }
});

app.use(Cors());

app.get("/", function (req, res) {
  res.redirect(301, "/api");
});

app.get("/api", function (req, res) {
  res.format({
    json: function () {
      res.send({
        title: "Welkom bij de MHC-Oss-api",
        description: "Api voor het het scrapen van data van de MHC-Oss website",
        endpoints: { teams: "/api/teams", team: "/api/teams/ + 'teamId'" },
        version: "version 1.0",
        lastUpdate: "17 November 2018"
      });
    }
  });
});

app.get("/api/teams", function (req, res) {
  let staticVal = "/api/teams/";
  let stream = x(
    "https://www.mhc-oss.nl/index.php?page=Teamlijst&teams",
    ".searchable-team-group-item",
    [
      {
        teamName: "h4",
        teamId: "h4 a@href | urlSplit",
        source: 'h4 a@href | urlSplit | static:"' + staticVal + '"'
      }
    ]
  ).stream();
  stream.pipe(res);
});

app.get("/api/teams/:name", function (req, res) {
  let name = req.params.name;

  let stream = x(
    "https://www.mhc-oss.nl/index.php?page=Team_" + name + "",
    ".game-schedule__day",
    {
      matches: x(".is-away-game", [
        {
          playDate: ".time | cleanUpText | trim | slice:0,10",
          playTime: ".time | cleanUpText | trim | cleanUpDate | slice:10,15",
          homeTeam: ".home-team | cleanUpText | trim",
          awayTeam: ".away-team | cleanUpText | trim",
          field: ".field | cleanUpText | trim | slice:5",
          awayUniform: ".away-uniform"
        }
      ]),
      arbiters: x(".content-block--arbiter", [
        {
          matchDate: ".formatted-date-title | cleanUpText",
          matchTime: ".arbiter-event-item__time | cleanUpText",
          teams: ".arbiter-event-item__match | cleanUpText | trim",
          umpires: ".arbiter-event-item__umpires | cleanUpText | cleanNames",
          location: ".arbiter-event-item__location",
          field: ".arbiter-event-item__field"
        }
      ])
    }
  ).stream();
  stream.pipe(res);
});
app.listen(process.env.PORT || 3001, () => console.log(`Server is running`));
