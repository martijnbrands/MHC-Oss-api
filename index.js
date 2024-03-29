const express = require("express");
const Cors = require("cors");
const Xray = require("x-ray");
const moment = require("moment");

const app = express();

const x = Xray({
  filters: {
    allow_matchTime_undefined: function(value=false){
      return value ? value : '00:00'
    },
    allow_field_undefined: function(value=false){
      return value ? value : 'n.n.b.'
    },
    cleanUpText: function (value) {
      return value.replace(/(\r\n|\n|\r)/gm, "");
    },
    cleanMatchId: function (value) {
      return value.replace("Nr. ", "");
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
    },
    dateTime: function (value) {
      let date = value.replace(/(\r\n|\n|\r)/gm, "").trim().replace(/\s/g, "").slice(0, 10)
      let time = value.replace(/(\r\n|\n|\r)/gm, "").trim().replace(/\s/g, "").slice(10, 15)
      
      let dateTime = moment(date + " " + time, "DD-MM-YYYY HH:mm");
      return dateTime
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
  
  let name = capitalizeFirstLetter(req.params.name);

  let stream = x(
    "https://www.mhc-oss.nl/index.php?page=Team_" + name + "",
    ".game-schedule__day",
    {
      info: x(".teampage-header__info",[
        {
          teamName: ".teampage-header__title",
          teamDescription: ".teampage-header__description | cleanUpText | trim"
        }
        
      ]),
      matches: x(".is-away-game", [
        {
          matchId: ".game-id | cleanUpText | cleanMatchId | trim",
          matchDateTime: ".time | allow_matchTime_undefined | dateTime",
          homeTeam: ".home-team | cleanUpText | trim",
          awayTeam: ".away-team | cleanUpText | trim",
          field: ".field | cleanUpText | trim | allow_field_undefined",
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
          field: ".arbiter-event-item__field | cleanUpText | trim"
        }
      ])
    }
  ).stream();
  stream.pipe(res);
});
app.listen(process.env.PORT || 3001, () => console.log(`Server is running`));

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}