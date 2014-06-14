angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('DocumentCtrl', function($scope) {
  
})

.controller('HomeCtrl', function($scope, $location) {
  $scope.openSpis = function() {
    $location.path('/app/spis/12345');
  }
})

.controller('LoginCtrl', function($scope, $location) {
  $scope.username = "bohdan.maslowski";
  
  $scope.login = function() {
    $location.path('/app/home');
  }
})

.controller('SpisCtrl', function($scope, $location) {
  $scope.title = '131/2012 - prodej nemovitosti';

  $scope.openDocument = function() {
    if(ionic.Platform.isAndroid())
      downloadFile('http://www.praetoris.cz/test.docx','application/msword','tmp001.docx');
    else
      $location.path('/app/document');
  }

});