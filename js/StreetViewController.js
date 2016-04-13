angular.module("streethear").controller("StreetViewController", ["$scope", "audioService", function($scope, audio) {
    var panorama = new google.maps.StreetViewPanorama(
      $('#pano')[0], {
        position: {
          lat: 40.7598567,
          lng: -73.9841719
        },
        pov: {
          heading: 270,
          pitch: 0
        },
        visible: true,
        linksControl: false,
        panControl: false,
        zoomControl: false,
        addressControl: false,
        enableCloseButton: false,
        fullscreenControl: false
      });

    panorama.addListener('position_changed', function() {
      var pos = panorama.getPosition();
      var lat = pos.lat()
      var lng = pos.lng()
      audio.updatePosition(lat, lng, 0)
    });

    panorama.addListener('pov_changed', function() {
      var headingRads = panorama.getPov().heading * Math.PI / 180
      audio.updateHeading(headingRads)
    });

    $scope.updatePosition = function(coords) {
      panorama.setPosition(coords)
    }

    $scope.updateHeading = function(degs) {
      panorama.setPov({
        heading: degs,
        pitch: 0
      })
    }
  }])
