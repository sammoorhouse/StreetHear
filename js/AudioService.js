angular.module("streethear").factory("audioService", ["$window", function($window) {
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
        console.log("loading " + filename)
        audioCtx.decodeAudioData(data, function(audioBuffer) {
            console.log("success " + filename)
            play(audioBuffer, lat, lng, 0, audioCtx)
          },

          function(e) {
            console.log("error " + filename)
            console.log("Error with decoding audio data" + e.err)
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
      console.log("play")
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
  }])
