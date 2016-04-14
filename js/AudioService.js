angular.module("streethear").factory("audioService", ["$window", "LocationsService",
  function($window, locationsService) {

    locationsService.locations(function(locations) {
      $.each(locations, function(i, location) {
        loadAudio(location.filename, location.lat, location.lng);
      })
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
          }
        )
      }
    }

    //initialise audiocontext
    var AudioContext = $window.AudioContext || $window.webkitAudioContext;
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
    }
  }
])
