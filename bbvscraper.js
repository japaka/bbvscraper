/**
 * Scraper für verschiedenen BBV-Online Seiten
 */

var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var mkdirp = require('mkdirp');

var teams = require('./teams.js');

/**
 * Standard URLS auf der BBV-Online Seite */
var URLS = {
  "schedule" : "http://www.basketball-bund.net/public/spielplan_list.jsp?print=1&viewDescKey=sport.dbb.liga.SpielplanViewPublic/index.jsp_&liga_id=",
  "results" : "http://www.basketball-bund.net/public/liste_xl.jsp?print=1&xl=1&liga_id=",
  "stats" : "http://www.basketball-bund.net/public/liste_xl.jsp?print=1&xl=1&liga_id="
};

/**
 * Erstellt eine Liste mit allen Spielen eines teams
 * @param {object} team
 * @returns {object} schedule
 */
function getSchedule(team){
  var schedule = [];
  var url = URLS.schedule + team.liga_id;
  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      var data = $("form[name='spielplanliste']");
      var table = data.children("table:nth-child(3)");
      var games = table.children("tr");
      //die erste TR muss raus
      var game1 = table.children("tr:nth-child(2)");
      games.splice(0,1);
      games.each(function(i){
        var game = $(this);
        var home = game.children("td:nth-child(4)").text().trim().replace(/TuS Fürstenfeldbruck/, team.name);
        var guest = game.children("td:nth-child(5)").text().trim().replace(/TuS Fürstenfeldbruck/,team.name);
        if(home == team.name || guest == team.name){
          schedule.push({
            "nr" : game.children("td:nth-child(1)").text().trim(),
            "gameday" : game.children("td:nth-child(2)").text().trim(),
            "date" : game.children("td:nth-child(3)").text().trim(),
            "home" : home,
            "guest" : guest,
            "location" : game.children("td:nth-child(6)").text().trim()
          })
        }
      })
    }
    saveFile("./teams/" + team.id, "schedule.json", schedule);
  });
}

function saveFile(location, filename, content){
  mkdirp(location, (err) => {
    if(err){
      console.log(err);
    }else{
      fs.writeFile(
        location + "/" + filename,
        JSON.stringify(content),
        function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Written file: " + location + "/" + filename);
          }
        }
      );
    }
  })
}

teams.forEach(function(team){
  getSchedule(team);
});

function createCompleteSchedule(){
  let completeSchedule = [];
  teams.forEach((team) => {
    let teamSchedule = require("./teams/" + team.id + "/schedule.json");
    let leString = JSON.stringify(teamSchedule);
    leString.replace(/TuS Fürstenfeldbruck/g, team.name);
    console.log(team.name);
    teamSchedule = JSON.parse(leString);
    completeSchedule.push({"team" : team.id, "games" : teamSchedule});
  });
  saveFile("./data", "completeSchedule.json", completeSchedule);
}
//createCompleteSchedule();
module.exports.getSchedule = getSchedule;