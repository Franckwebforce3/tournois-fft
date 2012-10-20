
var request = require('request');


request({
   qs: {
      sensor: true,
      address: "12 rue du Lac, 94160 Saint-Mande, France"
   },
   method: 'GET',
   url: 'http://maps.googleapis.com/maps/api/geocode/json'
}, function (error, response, body) {

      if(response.statusCode == 200){
         var ret = JSON.parse(body);
         console.log(ret.results[0].geometry.location);
      } else {
         console.log('error: '+ response.statusCode)
         console.log(body)
      }
});


     // o = obj["results"][0]["geometry"]["location"] # {"lng"=>-122.0840263, "lat"=>37.4216227}
