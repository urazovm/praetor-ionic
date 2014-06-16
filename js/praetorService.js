
angular.module('starter.praetorService', [])
  .factory('praetorService', function($http) {
  var instance = {
    
    // static data
    recent : {},
    currentSpis : {},

    // calls 
    login: function() {
      var promise = $http.get('http://praetoris.cz/service.php?call=login').then(function (response) {

        if(response.data.success)
        {
          instance.recent = response.data.recent
        }

        return response.data;
      });
      return promise;
    },
    
    getSpis: function(id) {
      console.log("getSpis "+id);
      var promise = $http.get('http://praetoris.cz/service.php?call=getSpis').then(function (response) {
        //console.log(response.data);
        instance.currentSpis = response.data;
        return response.data;
      });
      return promise;
    },
    
    
    
  };
  return instance;
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