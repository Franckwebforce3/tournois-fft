
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

var futursTournois = [];

for(var i = 0 ; i < tournois.length ; i++) {
    var tournoi = tournois[i];
    var epreuves = tournoi.epreuves;

    for(var j = 0 ; j < epreuves.length ; j++) {
        var epreuve = epreuves[j],
            d = epreuve.debut;

        var annee = 2000+parseInt(d.substr(6,2),10);
        var mois = parseInt(d.substr(3,2),10);

        if(annee === 2013 && mois >= 3 && mois <= 5) {
            futursTournois.push(tournoi);
            break;
        }
        // epreuve.debut
        // "debut": "27/09/12"
    }
}

fs.writeFileSync('tournois_futurs.js', "var tournois = "+JSON.stringify(futursTournois, null, 1)+";");
