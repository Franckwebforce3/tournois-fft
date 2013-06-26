
var request = require('request'),
    fs = require('fs'),
    async = require('async');


var tournoisStr = fs.readFileSync('tournois_with_location.json');

var tournois = JSON.parse(tournoisStr);


var keys_to_keep = ["hoi_iid", "club", "competition", "debut", "fin", "location", "nature", "categorie", "classement"];
var keys_to_delete = ["inscription", "installations"];

function walk(o) {
    if(Array.isArray(o)) {
        for(var i = 0 ; i < o.length ; i++) {
            walk(o[i]);
        }
    }
    else if(typeof o == "object") {
        for(var k in o) {
            if (o.hasOwnProperty(k)) {
                if(keys_to_keep.indexOf(k) != -1) {
                }
                else if (typeof o[k] == "object" && keys_to_delete.indexOf(k) == -1) {
                    walk(o[k]);
                }
                else {
                    delete o[k];
                }
            }
        }
    }
    else {
        console.log("euh...");
    }
}

walk(tournois);


fs.writeFileSync('tournois_simplified.js', "var tournois = "+JSON.stringify(tournois, null, 1)+";");
