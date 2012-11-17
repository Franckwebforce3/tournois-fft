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
console.log(body);
      });