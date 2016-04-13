angular.module("streethear")
.controller("NavController", ["$scope", "audioService", function($scope, audio) {
  $scope.move_timessq = function() {
    $scope.$parent.updatePosition({
      "lat": 40.7598567,
      "lng": -73.9841719
    })
    $scope.$parent.updateHeading(0)
  }
  $scope.move_36_b = function() {
    $scope.$parent.updatePosition({
      "lat": 40.7514509,
      "lng": -73.9898957,
    })
    $scope.$parent.updateHeading(0)
  }
  $scope.move_36_6 = function() {
    $scope.$parent.updatePosition({
      "lat": 40.7510879,
      "lng": -73.989044,
    })
    $scope.$parent.updateHeading(0)
  }

  $scope.toggleMute = audio.toggleMute;
}])
