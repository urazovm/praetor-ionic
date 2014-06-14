angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
  $scope.canGoBack = true;
})

.controller('DocumentCtrl', function($scope) {
  
})

.controller('HomeCtrl', function($scope, $location) {
  $scope.canGoBack = false;
  $scope.openSpis = function() {
    $location.path('/app/spis/12345');
  }
})

.controller('LoginCtrl', function($scope, $location, $ionicLoading) {
  $scope.username = "bohdan.maslowski";
  
  $scope.login = function() {
    $location.path('/app/home');
    //$ionicLoading.show({
    //  template: 'Loading...'
    //});
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