const express = require("express");
const Cors = require("cors");
const Xray = require("x-ray");
const app = express();

const x = Xray({
  filters: {
    cleanUpText: function(value) {
      return value
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace("Scheidsrechters: Oss H2 (O) (", "")
        .replace(")", "")
        .replace("(O", "");
    },
    trim: function(value) {
      return typeof value === "string" ? value.trim() : value;
    },
    slice: function(value, start, end) {
      return typeof value === "string" ? value.slice(start, end) : value;
    }
  }
});

x("https://www.mhc-oss.nl/index.php?page=Team_Heren2", ".game-schedule__day", {
  matches: x(".is-away-game", [
    {
      playTime: ".time | cleanUpText | trim",
      homeTeam: ".home-team | cleanUpText | trim",
      awayTeam: ".away-team | cleanUpText | trim",
      awayUniform: ".away-uniform"
    }
  ])
}).write("public/matches.json");

x(
  "https://www.mhc-oss.nl/index.php?page=Team_Heren2",
  ".content-block-content",
  {
    arbiters: x(".content-block--arbiter", [
      {
        matchDate: ".formatted-date-title | cleanUpText",
        matchTime: ".arbiter-event-item__time | cleanUpText",
        teams: ".arbiter-event-item__match | cleanUpText | trim",
        umpires: ".arbiter-event-item__umpires | cleanUpText",
        field: ".arbiter-event-item__field"
      }
    ])
  }
).write("public/arbiters.json");

app.use(Cors());

app.get("/api/matches", function(req, res) {
  res.sendFile(__dirname + "/public/matches.json");
});
app.get("/api/arbiters", function(req, res) {
  res.sendFile(__dirname + "/public/arbiters.json");
});

app.get("/", function(req, res) {
  res.format({
    json: function() {
      res.send({
        title: "Welkom bij de MHC-Oss-api",
        description: "Api voor het het scrapen van data van de MHC-Oss website",
        endpoints: { matches: "/api/matches", arbiters: "/api/arbiters" },
        version: "version 1.0",
        lastUpdate: "12 November 2018"
      });
    }
  });
});

app.listen(process.env.PORT || 3001, () => console.log(`Server is running`));
