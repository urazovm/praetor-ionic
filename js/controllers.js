angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('DocumentCtrl', function($scope) {
  
})

.controller('HomeCtrl', function($scope, $location) {
  $scope.openDocument = function() {
    $location.path('/app/document');
  }
$scope.openDocumentAlt = function() {
    window.open('http://www.praetoris.cz/test.docx');
  }
  $scope.openDocumentAndroid = function() {
    downloadFile('http://www.praetoris.cz/test.docx','application/msword','tmp001.docx');
  }
})

.controller('LoginCtrl', function($scope, $location) {
  $scope.username = "bohdan.maslowski";
  
  $scope.login = function() {
    $location.path('/app/home');
  }
})