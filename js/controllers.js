angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state) {
  $scope.$root.canGoBack = true;
  $scope.$root.sideMenuEnabled = false;//function() { return $state.current.name == 'app.home';} ;
})

.controller('DocumentCtrl', function($scope, $stateParams, $sce) {
  $scope.document = $sce.trustAsResourceUrl('http://update.praetoris.cz/test/' + $stateParams.documentId);
})

.controller('HomeCtrl', function($scope, $location) {
  console.log('here');
  $scope.$root.canGoBack = false;
  $scope.$root.sideMenuEnabled = true;
  $scope.openSpis = function() {
    $location.path('/app/spis/12345');
  }
})

.controller('LoginCtrl', function($scope, $location, $ionicLoading, PraetorService) {
  
  function doLogin()
  {
    $ionicLoading.show({
      template: 'Loading...'
    });
    PraetorService.call().then(function(d) {
      $ionicLoading.hide();
      $location.path('/app/home');
    });
  }
  
  $scope.$root.canGoBack = false;
  $scope.$root.sideMenuEnabled = false;
  var server = window.localStorage.getItem('server');
  var username = window.localStorage.getItem('username');
  var password = window.localStorage.getItem('password'); 
 
  if(server && username && password)
  {
    doLogin();
  }
  
  $scope.formData = {
    server: server || '',
    username: username || '',
    password: ''
  };
  

  $scope.login = function() {
    window.localStorage.setItem('server', $scope.formData.server);
    window.localStorage.setItem('username', $scope.formData.username);
    window.localStorage.setItem('password', $scope.formData.password);
    doLogin();
  }
})

.controller('SpisCtrl', function($scope, $location) {
  $scope.$root.sideMenuEnabled = false;

  $scope.title = '131/2012 - prodej nemovitosti';

  $scope.openDocument = function(doc, extension) {
     

    if(ionic.Platform.isAndroid()) {
      var mime = extension == 'docx' ? 'application/msword' : 'application/pdf';
      downloadFile('http://update.praetoris.cz/test/'+doc, mime,'tmp001.' + extension);
    }
    else
      window.open(
      'http://update.praetoris.cz/test/'+doc,
      '_blank',
      'enableViewportScale=yes,location=no,toolbarposition=top,transitionstyle=fliphorizontal,hidden=no,closebuttoncaption=Zpět'
      );
  }
})

.controller('SideMenuCtrl', function($scope, $location, $state, $ionicSideMenuDelegate) {

  $scope.logout = function()
  {
    window.localStorage.removeItem('password');
    $location.path('/login'); 
  }
 // toggle side menu with Menu button
 document.addEventListener('menubutton', function () { $ionicSideMenuDelegate.toggleRight(); }, false);
 
 // prevent returning to login page, close the app instead
 document.addEventListener('backbutton', function() { 
  if($state.current.name == 'app.home')
  {
    ionic.Platform.exitApp();
    return false;
  } 
  } , false);



});

