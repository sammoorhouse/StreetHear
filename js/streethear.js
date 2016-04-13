angular.module("streethear", [])
  .controller("MainController", ["$scope", "audioService", function($scope, audio) {
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

    $scope.updatePosition = function(coords){
      panorama.setPosition(coords)
    }

    $scope.updateHeading = function(degs){
      panorama.setPov({heading: degs, pitch: 0})
    }
  }])
  .controller("NavController", ["$scope", "audioService", function($scope, audio){

    $scope.move_timessq = function(){
      $scope.$parent.updatePosition({
        "lat": 40.7598567,
        "lng": -73.9841719
      })
      $scope.$parent.updateHeading(0)
    }

    $scope.move_36_b = function(){
        $scope.$parent.updatePosition({
          "lat": 40.7514509,
          "lng": -73.9898957,
        })
        $scope.$parent.updateHeading(0)
    }
    $scope.move_36_6 = function(){
        $scope.$parent.updatePosition({
          "lat": 40.7510879,
          "lng": -73.989044,
        })
        $scope.$parent.updateHeading(0)
    }

    $scope.toggleMute = audio.toggleMute;
  }])
  .factory("audioService", function() {
    //load audio descriptors
    $.getJSON({
        url: "audio/desc.json",
        dataType: "json",
        success: function(audios) {
          $.each(audios, function(i, audio) {
            loadAudio(audio.filename, audio.lat, audio.lng);
          })
        }
      })
      .error(function(d, textStatus, error) {
        console.log("error: ");
      })
      //load & process audio files
    function loadAudio(filename, lat, lng) {
      var loader = new XMLHttpRequest() //https://bugs.jquery.com/ticket/11461
      loader.open("GET", "audio/" + filename)
      loader.responseType = "arraybuffer"
      loader.onload = whenLoaded
      loader.send()

      function whenLoaded(event) {
        var data = loader.response

        if (data === null) {
          // There was a problem loading the file.
          console.log("There was a problem loading the file.")
          return
        }
        audioCtx.decodeAudioData(data, function(audioBuffer) {
          play(audioBuffer, lat, lng, 0, audioCtx)
        })
      }
    }

    //initialise audiocontext
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioCtx = new AudioContext()
    var gainNode = audioCtx.createGain()
    gainNode.connect(audioCtx.destination)

    function play(audioBuffer, x, y, z, audioContext) {
      var source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.loop = true

      var panner = audioContext.createPanner()
      panner.panningModel = "HRTF"
      panner.refDistance = 0.00001
      panner.rolloffFactor = 0.05
      panner.setPosition(x, y, z)

      source.connect(panner)
      panner.connect(gainNode)

      source.start()
    }

    //expose public API
    return {
      updatePosition: function(lat, lng) {
        audioCtx.listener.setPosition(lat, lng, 0)
      },
      updateHeading: function(heading) {
        audioCtx.listener.setOrientation(Math.cos(heading), 0, Math.sin(heading), 0, 1, 0)
      },
      toggleMute: function(){
        $("#mute").toggleClass("muted");

        if ($('#mute').is(".muted")) {
          gainNode.gain.value = 0;
          $('#mute-icon').toggleClass("fa-volume-off fa-volume-up")
          $('#mute-text').html("Unmute");
        } else {
          gainNode.gain.value = 1;
          $('#mute-icon').toggleClass("fa-volume-up fa-volume-off")
          $('#mute-text').html("Mute");
        }
      }
    }
  })
