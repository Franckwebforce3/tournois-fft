

/*
var groupMarkers = {};

var openedMarker = null;

  function addMarker(group, open) {
      if( groupMarkers[group.id] ) return;
      
      var contentString = '<h3><a href="/admin/groupadmin/general?group_id='+group.id+'" target="_new">'+group.name+'</a></h3>'+
                          group.address+'<br />'+
                          group.zipcode+' '+group.city+'<br />';
      
      var myLatlng = new google.maps.LatLng(group.lat,group.lng);

      var infowindow = new google.maps.InfoWindow({
          content: contentString
      });
      
      var image;
      if(open) {
        image = new google.maps.MarkerImage('https://code.google.com/intl/fr-FR/apis/maps/documentation/javascript/examples/images/beachflag.png',
             // This marker is 20 pixels wide by 32 pixels tall.
             new google.maps.Size(20, 32),
             // The origin for this image is 0,0.
             new google.maps.Point(0,0),
             // The anchor for this image is the base of the flagpole at 0,32.
             new google.maps.Point(0, 32));
        
      }

      var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          icon: image,
          title: group.name
      });
      google.maps.event.addListener(marker, 'click', function() {
        if(openedMarker) {
          openedMarker.close();
        }
        infowindow.open(map,marker);
        openedMarker = infowindow;
      });
      
      if(open) {
        infowindow.open(map,marker);
        openedMarker = infowindow;
      }
      
      groupMarkers[group.id] = marker;
  };
  
  function queryVisibleGroups() {
    var bounds = map.getBounds(),
        ne = bounds.getNorthEast(),
        sw = bounds.getSouthWest();
    
    
    YAHOO.util.Dom.get('loadIndicator').style.display = '';
            
      var groups = o.records;
      var content = "";
      for(var i = 0 ; i < groups.length ; i++) {
        var group = groups[i];
        addMarker(group);
        content += "<h4>"+group.name+"</h4>";
      }
      YAHOO.util.Dom.get('listContent').innerHTML = content;
      
      YAHOO.util.Dom.get('loadIndicator').style.display = 'none';
  };
  
  function clearMarkers() {
    groupMarkers
    for (i in groupMarkers) {
      if(i != "<%= @group.id %>")
          groupMarkers[i].setMap(null);
      }
  }
*/

YUI().use('node', 'event', 'io', 'json', function (Y) {

  var map;

    var myLatlng = new google.maps.LatLng("48.841334", "2.4185184");
    var myOptions = {
      zoom: 15,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    
    //addMarker(<%= @group.to_json %>, true);
        
    /*google.maps.event.addListener(map, 'zoom_changed', queryVisibleGroups);
    google.maps.event.addListener(map, 'dragend', queryVisibleGroups);*/
        
    /*setTimeout(function() {
      queryVisibleGroups();
    }, 1000);
        
        
    YAHOO.util.Event.addListener('activitySelect', 'change', function() {
      clearMarkers();
      queryVisibleGroups();
    });*/

  Y.io('scraper/tournois.json', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    on: {
        complete: function(id, o) {
          var tournois = Y.JSON.parse(o.responseText);
          console.log(tournois);
        }
    }
  });

});
