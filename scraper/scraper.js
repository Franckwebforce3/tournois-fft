
var request = require('request');
var htmlparser = require("htmlparser");
var async = require("async");


// <select name="lig_cno_3" onchange="onChangeLigue(this, 'cod_cno_3');"><option value="">Aucun</option><option value="01">ALSACE</option><option value="03">AUVERGNE</option><option value="04">BOURGOGNE</option><option value="05">BRETAGNE</option><option value="09">C.B.B.L.</option><option value="06">CENTRE</option><option value="07">CHAMPAGNE</option><option value="30">CORSE</option><option value="08">COTE D&#39;AZUR</option><option value="10">DAUPHINE SAVOIE</option><option value="31">ESSONNE</option><option value="99">FEDERATION FRANCAISE DE TENNIS</option><option value="11">FLANDRES</option><option value="12">FRANCHE COMTE</option><option value="28">GUADELOUPE</option><option value="25">GUYANE</option><option value="13">GUYENNE</option><option value="32">HAUTS DE SEINE</option><option value="14">LANGUEDOC ROUSSILLON</option><option value="15">LIMOUSIN</option><option value="16">LORRAINE</option><option value="17">LYONNAIS</option><option value="29">MARTINIQUE</option><option value="23">MIDI PYRENEES</option><option value="18">NORMANDIE</option><option value="24">NOUVELLE CALEDONIE</option><option value="19">PARIS</option><option value="02">PAYS DE LA LOIRE</option><option value="20">PICARDIE</option><option value="21">POITOU CHARENTES</option><option value="27">POLYNESIE</option><option value="22">PROVENCE</option><option value="26">REUNION</option><option value="37">SEINE ET MARNE</option><option value="33">SEINE ST DENIS</option><option value="35">VAL D&#39;OISE</option><option value="34">VAL DE MARNE</option><option value="38">YVELINES</option><option value="00">Z-DIVERS FFT</option></select></select>


function searchTournaments(lig_cno_1) {

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
                  console.log("terminé !");
                  
                  console.log( JSON.stringify(tournois, null, 3) );
                  
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

searchTournaments("19");









function fetchTournament(hoi_iid, cb) {
   
   console.log('http://www.ei.applipub-fft.fr/eipublic/competition.do?dispatch=afficher&hoi_iid='+hoi_iid);
   
   request({
      method: 'GET',
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
      responsable: inscriptionTableRows[1].children[1].children[0].data,
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
   var epreuveRows = epreuvesDom[0].children[0].children[0].children[0].children.slice(1);
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

   //console.log( JSON.stringify(tournament, null, 3) );
   
   return tournament;
}

//fetchTournament("82016871");




