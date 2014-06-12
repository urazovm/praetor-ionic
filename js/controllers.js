angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('DocumentCtrl', function($scope) {
  
})

.controller('HomeCtrl', function($scope, $location) {
  $scope.openDocument = function() {
    $location.path('/app/document');
  }
})

.controller('LoginCtrl', function($scope, $location) {
  $scope.username = "bohdan.maslowski";
  
  $scope.login = function() {
    $location.path('/app/home');
  }
})