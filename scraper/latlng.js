/**
 * Augmente tournois.json en ajoutant latitude/longitude grâce à une requête Google Maps
 * exporte tournois_with_location.json
 */
var request = require('request'),
    fs = require('fs'),
    async = require('async');


var latlngStr = fs.readFileSync('latlng.json');
var latlng = JSON.parse(latlngStr);


function location_for(address, cb) {

   if(!!latlng[address] && !!latlng[address].lat) {
      setTimeout(function() {
         cb(null, latlng[address]);
      }, 0);
      return;
   }

   console.log("----");
   console.log(address);

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
         var r;

         if(ret.status == "OVER_QUERY_LIMIT") {
            setTimeout(function() {
               latlng[address] = {};
               console.log({});
               cb(null, {});
            }, 5000);
         }

         if (ret.results.length > 0) {
            r = ret.results[0].geometry.location;
         }
         else {
            r = {};
         }
         latlng[address] = r;
         console.log(r);
         cb(null, r);
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
   var adr = tournoi.installations.adresse.replace(/\n\n/g, ', ').replace(/\&\#39\;/g, "'").replace(/\&quot\;/g, ' ').replace(/\n/g, ' ');
   //console.log(JSON.stringify(adr));

   location_for(adr, function (err, o) {
      tournoi.location = o;
      cb();
   });

}, function() {
   console.log("Done ! writing files...");
   fs.writeFileSync("tournois_with_location.json", JSON.stringify(tournois, null, 3) );


   /*for( var k in latlng) {
      if (k.indexOf('\n') != -1 || k.indexOf('&#39;') != -1  || k.indexOf('&quot;') != -1 ) {
         delete latlng[k];
      }
   }*/

   fs.writeFileSync("latlng.json", JSON.stringify(latlng, null, 3) );
   console.log("Done !");
});

