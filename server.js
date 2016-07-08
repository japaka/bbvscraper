var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/scrape/gamedetails', function(req, res){
  var gamestats;
  //Die Url 
  var urls = [
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395667&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395660&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395660&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395657&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395652&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395607&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395647&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395640&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395637&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395623&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395622&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395615&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395612&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395602&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395595&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395668&liga_id=16226&defaultview=1",
  "http://www.basketball-bund.net/public/ergebnisDetails.jsp?type=1&spielplan_id=1395592&liga_id=16226&defaultview=1"];

  urls.forEach(function(url){
    request(url, function(error, response, html){
      if(!error){
        var $ = cheerio.load(html);

        /**
        * Read the general gamestats
        */
        var gamestats = {"nr": "", "gameday" : "", "date" : "", "home" : "",  "guest": "", "final": "", "first" : "", "second": "", "third" : "", "ot" : ""};
        
        var data = $("form[name='ergebnisliste']");
        var generalTable = data.children("table:nth-child(2)").children("tr:nth-child(2)");
        gamestats.nr = generalTable.children("td:nth-child(1)").text().trim();
        gamestats.gameday = generalTable.children("td:nth-child(2)").text().trim();
        gamestats.date = generalTable.children("td:nth-child(3)").text().trim();
        gamestats.home = generalTable.children("td:nth-child(4)").text().trim();
        gamestats.guest = generalTable.children("td:nth-child(5)").text().trim();
        gamestats.final = generalTable.children("td:nth-child(6)").text().trim();
        gamestats.first = generalTable.children("td:nth-child(7)").text().trim();
        gamestats.second = generalTable.children("td:nth-child(8)").text().trim();
        gamestats.third = generalTable.children("td:nth-child(9)").text().trim();
        gamestats.ot = generalTable.children("td:nth-child(10)").text().trim();

        /*
        * Read the player stats for each team
        */
        //All rows, that are not the first row ...

        var homeplayers = [];
        var guestplayers = [];
        var home = $("form[name='spielerstatistikheim']").children("table:nth-child(2)").children("tr:not(:nth-child(1))");
        var guest = $("form[name='spielerstatistikgast']").children("table:nth-child(2)").children("tr:not(:nth-child(1))");

        // Read the stat of every player...
        // jQuery function .each()

        home.each(function(){
          var $this = $(this);
          var player = {
            "name" : $(this).children("td:nth-child(1)").text().trim(),
            "firstname" : $this.children("td:nth-child(2)").text().trim(),
            "points" : $this.children("td:nth-child(3)").text().trim(),
            "fwa" : $this.children("td:nth-child(4)").text().trim(),
            "fwm" : $this.children("td:nth-child(5)").text().trim(),
            "fgm" : $this.children("td:nth-child(6)").text().trim(),
            "tpm" : $this.children("td:nth-child(7)").text().trim(),
            "fouls" : $this.children("td:nth-child(8)").text().trim()
          }
          homeplayers.push(player);
        });
        guest.each(function(){
          var $this = $(this);
          var player = {
            "name" : $(this).children("td:nth-child(1)").text().trim(),
            "firstname" : $this.children("td:nth-child(2)").text().trim(),
            "points" : $this.children("td:nth-child(3)").text().trim(),
            "fwa" : $this.children("td:nth-child(4)").text().trim(),
            "fwm" : $this.children("td:nth-child(5)").text().trim(),
            "fgm" : $this.children("td:nth-child(6)").text().trim(),
            "tpm" : $this.children("td:nth-child(7)").text().trim(),
            "fouls" : $this.children("td:nth-child(8)").text().trim()
          }
          guestplayers.push(player);
        });

        //Add the player stats to the gamestats
        gamestats.homeplayerstats = homeplayers;
        gamestats.guestplayerstats = guestplayers;

        fs.writeFile("games/" + gamestats.nr + ".json", JSON.stringify(gamestats), function(err){
          console.log('file written');
        });
      }
    });

  });
});
app.get("/scrape/games", function(req,res){
  var url = "http://www.basketball-bund.net/public/ergebnisse.jsp?print=1&viewDescKey=sport.dbb.liga.ErgebnisseViewPublic/index.jsp_&liga_id=16226";
    request(url, function(error, response, html){
      if(!error){
        var allgames = [];
        var $ = cheerio.load(html);
        var data = $("form[name='ergebnisliste']");
        var games = data.children("table:nth-child(3)").children("tr:not(:nth-child(1))");
        games.each(function(){
          var $this = $(this);
          var game ={
            "id" : $(this).children("td:nth-child(1)").text().trim(),
            "gameday" : $(this).children("td:nth-child(2)").text().trim(),
            "date" : $(this).children("td:nth-child(3)").text().trim(),
            "home" : $(this).children("td:nth-child(4)").text().trim(),
            "guest" : $(this).children("td:nth-child(5)").text().trim(),
            "final" : $(this).children("td:nth-child(6)").text().trim(),
            "first" : $(this).children("td:nth-child(7)").text().trim(),
            "second" : $(this).children("td:nth-child(8)").text().trim(),
            "third" : $(this).children("td:nth-child(9)").text().trim(),
            "ot" : $(this).children("td:nth-child(10)").text().trim()
          }
          allgames.push(game);
        });
        fs.writeFile("games/allgames.json", JSON.stringify(allgames), function(err){
          console.log('file written');
        });
      }
    })
});

app.get("/scrape/teamstats", function(req,res){
  var url = "http://www.basketball-bund.net/liga/statistik_team.jsp?print=1&viewDescKey=sport.dbb.views.TeamStatView/templates/base_template.jsp_&liga_id=16226";

    request(url, function(error, response, html){
      if(!error){
        var teamstats = [];
        var $ = cheerio.load(html);
        var data = $("form[name='teamstat']");
        var row = data.children("table:nth-child(4)").children("tr:not(:nth-child(1))");
        row.each(function(){
          var $this = $(this);
          var stat = {
            "rank" : $this.children("td:nth-child(1)").text().trim(),
            "team" : $this.children("td:nth-child(2)").text().trim(),
            "points" : $this.children("td:nth-child(3)").text().trim(),
            "buckets" : $this.children("td:nth-child(4)").text().trim(),
            "diff" : $this.children("td:nth-child(5)").text().trim(),
            "fw" : $this.children("td:nth-child(6)").text().trim(),
            "fgm" : $this.children("td:nth-child(8)").text().trim(),
            "tpm" : $this.children("td:nth-child(9)").text().trim(),
            "fouls" : $this.children("td:nth-child(10)").text().trim()
          };
          teamstats.push(stat);
        });
        fs.writeFile("stats/teamstats.json", JSON.stringify(teamstats), function(err){
          console.log('teamstats written');
        });
      }
    });
});
app.listen('8081');

console.log('Scraping happening on 8081');

exports = module.exports = app;
