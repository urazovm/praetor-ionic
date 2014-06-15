// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider


    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: "LoginCtrl"
    })


    .state('app.home', {
      url: "/home",
      views: {
        'menuContent' :{
          templateUrl: "templates/home.html",
          controller: 'HomeCtrl'
        }
      }
    })

    .state('app.spis', {
      url: "/spis/:playlistId",
      views: {
        'menuContent' :{
          templateUrl: "templates/spis.html",
          controller: 'SpisCtrl'
        }
      }
    })
    .state('app.document', {
      url: "/document/:documentId",
      views: {
        'menuContent' :{
          templateUrl: "templates/document.html",
          controller: 'DocumentCtrl'
        }
      }
    })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

      function openIntent(url, mime)
      {
        window.plugins.webintent.startActivity({
            action: window.plugins.webintent.ACTION_VIEW,
            url: url,
            type: mime
          },
          function() {},
          function(x) {
            alert(x);
            alert('Failed to open URL via Android Intent.');
            console.log("Failed to open URL via Android Intent.")
          }
      );
      }

      function downloadFile(fileUrl, mimeType, tempName){

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
          function onFileSystemSuccess(fileSystem) {
              fileSystem.root.getFile(
              "dummy.html", {create: true, exclusive: false}, 
              function gotFileEntry(fileEntry) {
                  sPath = fileEntry.toNativeURL().replace("dummy.html","");
                                    
                  var fileTransfer = new FileTransfer();
                  fileEntry.remove();
      
                  fileTransfer.download(
                      fileUrl,
                      sPath + tempName,
                      function(theFile) {
                          openIntent(theFile.toNativeURL(), mimeType);
                      },
                      function(error) {
                          alert("download error source " + error.source);
                          alert("download error target " + error.target);
                          alert("upload error code: " + error.code);
                      }
                  );
              }, function(e) { alert(e); } );
          }, function(e) { alert(e); });
};


//http://forum.ionicframework.com/t/android-look-ionicactionsheet-android-hardware-menu-button/3630/3