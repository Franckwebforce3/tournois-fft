var request = require('request');

var a = "355 rue de la bretechelle, 78370 PLAISIR";

request({
   qs: {
      sensor: true,
      address: a
   },
   method: 'GET',
   url: 'http://maps.googleapis.com/maps/api/geocode/json'

}, function (error, response, body) {
   
   console.log(response.statusCode);
   console.log(body);

   if(response.statusCode == 200){
      var ret = JSON.parse(body);
      
      if(ret.status == "OVER_QUERY_LIMIT") {
         console.log("OVER_QUERY_LIMIT");
      }
   }

});