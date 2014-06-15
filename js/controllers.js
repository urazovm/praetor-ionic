angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
  $scope.canGoBack = true;
})

.controller('DocumentCtrl', function($scope, $stateParams, $sce) {
  $scope.document = $sce.trustAsResourceUrl('http://update.praetoris.cz/test/' + $stateParams.documentId);
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

  $scope.openDocument = function(doc, extension) {
    var mime = extension == 'docx' ? 'application/msword' : 'application/pdf'; 
    //test();return;
    if(ionic.Platform.isAndroid())
      downloadFile('http://update.praetoris.cz/test/'+doc, mime,'tmp001.' + extension);
    else
      window.open(
      'http://update.praetoris.cz/test/'+doc,
      '_blank',
      'enableViewportScale=yes,location=no,toolbarposition=top,transitionstyle=fliphorizontal,hidden=no,closebuttoncaption=Zpět'
      );
      //$location.path('/app/document/'+doc);
  }

})

.controller('SideMenuCtrl', function($scope, $ionicSideMenuDelegate) {
 function onMenuKeyDown() {
  	alert('down');
    //$ionicSideMenuDelegate.toggleRight();
  };
 document.addEventListener("menubutton", onMenuKeyDown, false);
});

