/**
 * Scrapper du site de recherche de competition FFT
 * exporte tournois.json
 */
var request = require('request'),
    htmlparser = require("htmlparser"),
    async = require("async"),
    fs = require('fs');

function searchTournamentsByLigue(lig_cno_1, cb) {

   var params = {
      dispatch: "filtrer",
      tri: "",
      hoi_atp: "T",
      dtdate: "01/10/2012",
      mois: "12",
      multi_lig_cod: "0",
      lig_cno_1: lig_cno_1,
      cod_cno_1: "",
      lig_cno_2: "",
      lig_cno_3: "",
      bidf: "0",
      ins_ccp: "",
      ins_cville: "",
      clu_cno_club: "",
      hoiCtourInt: "N", 
      iannee_naiss: "",
      limit_categ_age: "0",
      asexe: "",
      rcl_iid: "",
      nae_icod: "",
      cah_icod: ""
   };

   request({
      form: params,
      method: 'POST',
      encoding: 'binary',
      url: 'http://www.ei.applipub-fft.fr/eipublic/competitionRecherche.do'
   }, function (error, response, body) {

      if(response.statusCode == 200){
         var handler = new htmlparser.DefaultHandler(function(err, dom) {
            if (err) {
               console.log("Error: " + err);
            }
            else {
               var tournois = parseTournamentSearchPage(dom);
               
               async.forEachSeries(tournois, function(tournoi, cb) {
                  
                  fetchTournament(tournoi.hoi_iid, function(t) {
                     tournoi.inscription = t.inscription;
                     tournoi.installations = t.installations;
                     tournoi.epreuves = t.epreuves;
                     cb();
                  });
                  
               }, function() {
                  cb(tournois);
               });
               
            }
         }, { verbose: false, ignoreWhitespace: true });
         var parser = new htmlparser.Parser(handler);
         parser.parseComplete(body);
      } else {
         console.log('error: '+ response.statusCode)
         console.log(body)
      }
   });

}



// iterate from '00 to '38'
var ligues = [];
for (var i = 0; i < 39; i++) {
   ligues.push( i < 10 ? '0'+i : String(i) );
}
var all = [];
async.forEachSeries(ligues, function(ligue, cb) {
   console.log("Ligue: "+ligue);
   searchTournamentsByLigue(ligue, function(tournois) {
      all = all.concat(tournois);
      cb();
   });
}, function() {
   console.log("terminé !");
   fs.writeFileSync("tournois.json", JSON.stringify(all, null, 3) );
});










function fetchTournament(hoi_iid, cb) {
   
   console.log('http://www.ei.applipub-fft.fr/eipublic/competition.do?dispatch=afficher&hoi_iid='+hoi_iid);

   request({
      method: 'GET',
      encoding: 'binary',
      url: 'http://www.ei.applipub-fft.fr/eipublic/competition.do?dispatch=afficher&hoi_iid='+hoi_iid
   }, function (error, response, body) {

      if(response.statusCode == 200){
         var handler = new htmlparser.DefaultHandler(function(err, dom) {
            if (err) {
               console.log("Error: " + err);
            }
            else {
               cb( parseTournamentPage(dom) );
            }
         }, { verbose: false, ignoreWhitespace: true });
         var parser = new htmlparser.Parser(handler);

         parser.parseComplete(body);
      } else {
         console.log('error: '+ response.statusCode)
         console.log(body)
      }
   });
   
}



/**************************
 * Parsing
 **************************/


function parseTournamentSearchPage(dom) {
   var table = htmlparser.DomUtils.getElements( { class: "L1" }, dom)[0].children[0].children[0].children[0];
   var rows = table.children.slice(1); // skip "top" row
   var tournois = [];
   rows.forEach(function(row) {
      tournois.push( parseTournamentRow(row) );
   });
   return tournois;
}

function parseTournamentRow(row) {
   var cells = row.children;
   var tournoi = {
      hoi_iid: cells[0].children[0].attribs.href.substr(41),
      inscriptionEnLigne: !!(cells[1].children),
      resultatsConsultables: !!(cells[2].children),
      programmePubliable: !!(cells[3].children),
      annee_sportive: cells[5].children[0].data,
      ligue: cells[6].children[0].data.trim(),
      dpt: cells[7].children[0].data,
      club: cells[8].children[0].data,
      competition: (cells[9].children[0].children[0].children[0].data).replace('&#39;',"'"),
      codePostal: cells[10].children[0].data,
      ville: cells[11].children[0].data,
      debut: cells[12].children[0].data.trim(),
      fin: cells[13].children[0].data.trim()
   };
   return tournoi;   
}


function parseTournamentPage(dom) {

   var tables = htmlparser.DomUtils.getElements( { class: "form" }, dom);
   
   var competitionTableRows = tables[0].children;

   var competition = {
      nom: competitionTableRows[0].children[1].children[0].data,
      code: competitionTableRows[1].children[1].children[0].data,
      annee: competitionTableRows[2].children[1].children[0].data,
      debutfin: competitionTableRows[3].children[1].children[0].data,
      ligue: competitionTableRows[4].children[1].children[0].data,
      dpt: competitionTableRows[5].children[1].children[0].data,
      club: competitionTableRows[6].children[1].children[0].data,
      jugeArbitre: competitionTableRows[7].children[1].children[0].data.trim(),
      prix: competitionTableRows[8].children[1].children[0].data,
      publicationResultats: competitionTableRows[9].children[1].children[0].data ? competitionTableRows[9].children[1].children[0].data.trim() : "",
      programmeConsultatbles: competitionTableRows[10].children[1].children[0].data ? competitionTableRows[10].children[1].children[0].data.trim() : ""
   };
   
   
   var inscriptionTableRows = tables[1].children;
   var inscription = {
      enLigne: inscriptionTableRows[0].children[1].children[0].data ? inscriptionTableRows[0].children[1].children[0].data.trim() : "",
      responsable: inscriptionTableRows[1].children[1].children && inscriptionTableRows[1].children[1].children.length > 0 ? inscriptionTableRows[1].children[1].children[0].data : "",
      adresse: inscriptionTableRows[2].children[1].children.map(function(i){ return i.data ? i.data.trim() : ""; }).join('\n'),
      telBureau: inscriptionTableRows[3].children[1].children ? inscriptionTableRows[3].children[1].children[0].data : "",
      telDomicile: inscriptionTableRows[4].children[1].children ? inscriptionTableRows[4].children[1].children[0].data : "",
      telMobile: inscriptionTableRows[5].children[1].children ? inscriptionTableRows[5].children[1].children[0].data : "",
      fax: inscriptionTableRows[6].children[1].children ? inscriptionTableRows[6].children[1].children[0].data : "",
      email: inscriptionTableRows[7].children[1].children[0].children ? inscriptionTableRows[7].children[1].children[0].children[0].data : ""
   };
   
   
   var installationsTableRows = tables[2].children;
   var installations = {
      adresse: installationsTableRows[0].children[1].children.map(function(i){ return i.data ? i.data.trim() : ""; }).join('\n'),
      surfaces: installationsTableRows[1].children[1].children ? installationsTableRows[1].children[1].children[0].children.map(function(i){ return i.children[0].children[0].data.trim(); }).join('\n') : ""
   };
   
   
   // Parse epreuves
   var epreuvesDom = htmlparser.DomUtils.getElements( { class: "L1", tag_name: "table" }, dom);
   var epreuveRows = !!epreuvesDom && !!epreuvesDom[0] && !!epreuvesDom[0].children && !!epreuvesDom[0].children[0].children && !!epreuvesDom[0].children[0].children[0].children[0].children ? epreuvesDom[0].children[0].children[0].children[0].children.slice(1) : [];
   var epreuves = [];
   epreuveRows.forEach(function(row) {
      var cells = row.children;
      // cells[0] => epr_iid
      // cells[1] => inscriptionEnLigne
      // cells[2] => resultatsConsultables
      epreuves.push({
         nom: cells[3].children[0].data,
         nature: cells[4].children[0].data,
         categorie: cells[5].children[0].data,
         classement: cells[6].children[0].data.trim(),
         debut: cells[7].children[0].data,
         fin: cells[8].children[0].data,
         tarifAdulte: cells[9].children[0].data,
         tarifJeune: cells[10].children[0].data
      });
   });

   
   var tournament = {
      inscription: inscription,
      installations: installations,
      epreuves: epreuves
   };
   
   return tournament;
}





