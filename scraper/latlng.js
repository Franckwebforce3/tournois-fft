/**
 * Augmente tournois.json en ajoutant latitude/longitude grâce à une requête Google Maps
 * exporte tournois_with_location.json
 */
var request = require('request'),
    fs = require('fs'),
    async = require('async');

function location_for(address, cb) {

   request({
      qs: {
         sensor: true,
         address: address
      },
      method: 'GET',
      url: 'http://maps.googleapis.com/maps/api/geocode/json'
   }, function (error, response, body) {

      if(response.statusCode == 200){
         var ret = JSON.parse(body);

         cb(null, ret.results.length > 0 ? ret.results[0].geometry.location : {});
      } else {
         console.log('error: '+ response.statusCode)
         console.log(body);
         cb("Unable to get lat/lng");
      }
   });

}

var tournoisStr = fs.readFileSync('tournois.json');
var tournois = JSON.parse(tournoisStr);

async.forEachSeries(tournois, function(tournoi, cb) {

   // Cleanup adresse : 
   var adr = tournoi.installations.adresse.replace(/\n\n/g, ', ');

   console.log("----");
   console.log(adr);
   //console.log(JSON.stringify(adr));

   location_for(adr, function (err, o) {
      tournoi.location = o;
      console.log(o);
      cb();
   });

}, function() {
   console.log("Done !");
   fs.writeFileSync("tournois_with_location.json", JSON.stringify(tournois, null, 3) );
});

