
var request = require('request'),
    fs = require('fs'),
    async = require('async');


var latlngStr = fs.readFileSync('latlng.json');
var latlng = JSON.parse(latlngStr);


var with_lat = 0;
var without_lat = 0;
for(var k in latlng) {
   if(latlng[k].lat) {
      with_lat++;
   }
   else {
      without_lat++;
   }
}

var total = with_lat + without_lat;

console.log("WITH LAT : "+with_lat+"/"+total+" (" + Math.floor(with_lat/total*100) + "%)");
console.log("WITHOUT  : "+without_lat+"/"+total+" (" + Math.floor(without_lat/total*100) + "%)");