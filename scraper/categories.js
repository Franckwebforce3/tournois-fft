
var request = require('request'),
    fs = require('fs'),
    async = require('async');


var tournoisStr = fs.readFileSync('tournois.json');
var tournois = JSON.parse(tournoisStr);

var categories = {};

tournois.forEach(function(t) {

   t.epreuves.forEach(function(e) {
      categories[e.nature] = true;
   })

});

console.log( Object.keys(categories) );