angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state) {
  $scope.$root.canGoBack = true;
  $scope.$root.sideMenuEnabled = false;//function() { return $state.current.name == 'app.home';} ;
})

.controller('DocumentCtrl', function($scope, $stateParams, $sce) {
  $scope.document = $sce.trustAsResourceUrl('http://update.praetoris.cz/test/' + $stateParams.documentId);
})

.controller('HomeCtrl', function($scope, $location, $ionicLoading, praetorService) {
  $scope.$root.canGoBack = false;
  $scope.$root.sideMenuEnabled = true;

  $scope.recentItems = praetorService.recent;

  $scope.openSpis = function(spis) {
    spis.loading = true;
    //$ionicLoading.show({
    // template: 'Loading...'
    //});
    praetorService.getSpis(spis.id).then(function(d) {
      spis.loading = false;
      //$ionicLoading.hide();
      $location.path('/app/spis');
    });
  }
})

.controller('LoginCtrl', function($scope, $location, $ionicLoading, praetorService) {
  
  function doLogin()
  {
    $ionicLoading.show({
      template: 'Loading...'
    });
    praetorService.login().then(function(d) {
      $ionicLoading.hide();
      if(d.success)
      {
        $location.path('/app/home');
      }
      else
      {
        $scope.message = d.message;
      }
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

.controller('SpisCtrl', function($scope, $location, praetorService) {
  $scope.$root.sideMenuEnabled = false;

  $scope.spis = praetorService.currentSpis;
  
  $scope.openDocument = function(file) {
     

    if(ionic.Platform.isAndroid()) {
      downloadFile('http://update.praetoris.cz/test/'+file.name+'.'+file.extension, file.mime,'tmp001.' + file.extension);
    }
    else
      window.open(
      'http://update.praetoris.cz/test/'+file.name+'.'+file.extension,
      '_blank',
      'enableViewportScale=yes,location=no,toolbarposition=bottom,transitionstyle=fliphorizontal,hidden=no,closebuttoncaption=Zpět'
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
    // TODO: better stay at the home page
    ionic.Platform.exitApp();
  } 
  } , false);



});

