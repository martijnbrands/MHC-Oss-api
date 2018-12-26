# MHC-Oss-api

API voor het het scrapen van data van de MHC-Oss website.

### Installation


```
git clone https://github.com/martijnbrands/MHC-Oss-api.git
```
```
cd MHC-Oss-api
npm install 
node index.js
```

### Endpoints

| Method | URL |
| ------ | ------ |
| GET | /api |
| GET | /api/teams |
| GET | /api/teams/{teamId} |

### Examples
```
/api/teams
```


    [
      {
        "teamName": "Team 1", 
        "teamId": "Team1",
        "source": "/api/teams/Team1"
      }
    ]
    
&nbsp;
&nbsp;
```
/api/teams/Team1
```

      {
        matches: [
            {
                "playTime": "10-03-2019",
                "homeTeam": "Team 2",
                "awayTeam": "Team 1"
            }
        ],
        arbiters": [
            {
                "matchDate": "Zondag 27 januari",
                "matchTime": "15:30",
                "teams": "Team 3 - Team 4",
                "umpires": "Name 1 - Name 2"
            }
        ]
      }

