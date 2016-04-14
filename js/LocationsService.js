angular.module("streethear")
  .factory("LocationsService", function($http) {
    //load audio descriptors
    var loadPromise = $http.get('audio/desc.json')

    return {
      locations: function(cb) {
        loadPromise.then(function(locations) {
          cb(locations.data)
        });
      }
    }
  })
