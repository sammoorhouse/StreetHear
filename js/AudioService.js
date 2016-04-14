angular.module("streethear").factory("audioService", ["$window", "$http", "LocationsService",
  function($window, $http, locationsService) {

    //initialise audiocontext
    var AudioContext = $window.AudioContext || $window.webkitAudioContext;
    var audioCtx = new AudioContext()
    var gainNode = audioCtx.createGain()
    var allLocations = []
    var playingLocations = []
    var playingSources = []
    var maxPlayingLocations = 3

    gainNode.connect(audioCtx.destination)

    locationsService.locations(function(locations) {
      $.each(locations, function(i, location) {
        allLocations[i] = location
        loadAudio(location.filename, location.lat, location.lng);
      })
    })

    //load & process audio files
    function loadAudio(filename, lat, lng) {
      $http({
        url: 'audio/' + filename,
        method: 'GET',
        responseType: 'arraybuffer'
      }).success(function(resp) {
        audioCtx.decodeAudioData(resp, function(audioBuffer) {
          var source = play(audioBuffer, lat, lng, 0, audioCtx)
          playingSources[filename] = source
        })
      });
    }

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
      return source
    }

    function findClosestAudioSources(lat, lng) {
      return allLocations.sort(function(fst, snd) {
        var fstDistance = Math.sqrt(Math.pow((fst.lat - lat), 2) + (Math.pow(fst.lng - lng), 2))
        var sndDistance = Math.sqrt(Math.pow((snd.lat - lat), 2) + (Math.pow(snd.lng - lng), 2))
        return fstDistance > sndDistance ? 1 : -1
      }).slice(0, maxPlayingLocations)
    }

    function updatePlayingSources(newLocations) {
      $(playingLocations)
        .not(newLocations)
        .each(function(i, location) {
          playingSources[location.filename].loop = false //end eventually
          playingLocations.splice(playingLocations.indexOf(location), 1)
        })
      $(newLocations)
        .not(playingLocations)
        .each(function(i, location) {
          loadAudio(location.filename, location.lat, location.lng)
          playingLocations.push(location)
        })
    }

    //expose public API
    return {
      updatePosition: function(lat, lng) {
        var closest = findClosestAudioSources(lat, lng)
        updatePlayingSources(closest)
        audioCtx.listener.setPosition(lat, lng, 0)
      },
      updateHeading: function(heading) {
        audioCtx.listener.setOrientation(Math.cos(heading), 0, Math.sin(heading), 0, 1, 0)
      },
    }
  }
])
