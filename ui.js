
var TournoiFinder = {

    init: function () {
        this.preferences = {
            categorie: "Senior",
            classement: "NC",
            nature: "Simple Messieurs"
        };
        this.initEvents();
        this.createMap();
        this.getTournois();
    },

    initEvents: function() {
        var that = this;
        $('#preferences-form').submit(function() {
            that.onPreferencesSubmit();
            return false;
        });
    },

    onPreferencesSubmit: function() {
        var data = $('#preferences-form').serializeArray();
        for(var i = 0 ; i < data.length; i++) {
            this.preferences[data[i].name] = data[i].value;
        }
        // TODO: redirect to map
        $('.nav-tabs a[href=#tab-map]').tab('show') ;
        this.onMapChanged();
    },

    filterPreferences: function(tournois) {
        var results = [];
        // TODO: classement !
        for(var i = 0 ; i < tournois.length ; i++) {
            var tournoi = tournois[i];
            for(var j = 0 ; j < tournoi.epreuves.length; j++) {
                if(tournoi.epreuves[j].categorie == this.preferences.categorie && tournoi.epreuves[j].nature == this.preferences.nature) {
                    results.push(tournois[i]);
                    break;
                }
            }
        }

        return results;
    },

    createMap: function () {
        this.markers = [];
        this.center = new google.maps.LatLng("48.841334", "2.3185184");
        this.map = new google.maps.Map(document.getElementById("map_canvas"), {
            zoom: 12,
            center: this.center,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        var that = this;
        var mapChanged = function() {
            that.center = that.map.getCenter();
            that.onMapChanged();
        };
        google.maps.event.addListener(this.map, 'zoom_changed', mapChanged);
        google.maps.event.addListener(this.map, 'dragend', mapChanged);

        var that = this;
        if (geo_position_js.init()) {
            geo_position_js.getCurrentPosition(function (p) {
                that.center = new google.maps.LatLng( p.coords.latitude, p.coords.longitude);
                that.map.setCenter(that.center);
            }, function () {
                alert("Could not find you!");
            });
        }
    },

    onMapChanged: function() {
        var bounds = this.map.getBounds();

        // Filter visibles
        var tournois = this.filterByBounds(bounds, this.filterPreferences(this.tournois) );

        // Display markers
        this.clearMarkers();
        for(var i = 0 ; i < tournois.length ; i++) {
            this.addMarker(tournois[i]);
        }
    },

    filterByBounds: function(bounds, tournois) {
        var results = [];

        var ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest();
        for(var i = 0 ; i < tournois.length ; i++) {
            var loc = tournois[i].location;
            if (loc.lat) {
                var maxLat = Math.max(sw.lat(), ne.lat()),
                    minLat = Math.min(sw.lat(), ne.lat()),
                    maxLng = Math.max(sw.lng(), ne.lng()),
                    minLng = Math.min(sw.lng(), ne.lng())

                if (loc.lat > minLat && loc.lat < maxLat && 
                    loc.lng > minLng && loc.lng < maxLng ) {
                    results.push(tournois[i]);
                }
            }
        }
        return results;
    },

    addMarker: function (tournoi) {
        //console.log(tournoi);

        var myLatlng = new google.maps.LatLng(tournoi.location.lat,tournoi.location.lng);

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: this.map,
            //icon: image,
            title: tournoi.club
        });

        var infowindow = new google.maps.InfoWindow({
          content: tournoi.club+"<br /><a href='http://www.ei.applipub-fft.fr/eipublic/competition.do?dispatch=afficher&hoi_iid="+tournoi.hoi_iid+"' target='_new'>"+tournoi.competition+"</a><br />du "+tournoi.debut+" au "+tournoi.fin
        });

        var that = this;
        google.maps.event.addListener(marker, 'click', function() {
            if(that.openedMarker) {
                that.openedMarker.close();
            }
            infowindow.open(that.map,marker);
            that.openedMarker = infowindow;
        });

        this.markers.push(marker);
    },

    /*mapClick: function() {
        var that = this;
        setTimeout(function() {
            google.maps.event.trigger(that.map, "resize");
            that.map.setCenter(that.center);
            that.onMapChanged();
        }, 100);
    },*/

    getTournois: function () {
        var that = this;
        $.ajax({
            url: "scraper/tournois_with_location.json",
            dataTypeString: "json"
        }).done(function(tournois) {
            that.tournois = tournois;

            setTimeout(function() {
                that.onMapChanged();
            }, 1000);
        });
    },

    clearMarkers: function() {
        for(var i = 0 ; i < this.markers.length; i++) {
          this.markers[i].setMap(null);
          delete this.markers[i];
        }
        this.markers = [];
    }


};

$(document).ready(function(){
    TournoiFinder.init();
});
