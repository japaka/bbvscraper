var express = require('express');
//var request = require('request');
//var cheerio = require('cheerio');
var app = express();
var bbvscraper = require('./bbvscraper.js');
var teams = require('./teams.js');

app.get("/scrape/schedule", function(req,res){
  teams.forEach(function(team){
    bbvscraper.getSchedule(team);
  });
});
app.listen('8081');

console.log('Scraping happening on 8081');

exports = module.exports = app;
