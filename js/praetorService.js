 //test
angular.module('starter.praetorService', [])
  .factory('praetorService', function ($http) {
      var instance = {

          // calls 
          login: function () {
              return instance.getdata("login", {});
          },
          getSpis: function (id) {
              return instance.getdata("getspis", { "id_spis": id });
          },
          getSpisy: function () {
              return instance.getdata("getspisy", { });
          },
          getdata: function (action, data) {
              var server = window.localStorage.getItem('server');
              var username = window.localStorage.getItem('username');
              var password = window.localStorage.getItem('password');

              data.username = username;
              data.password = password;

              var promise = $http.post(
                  'http://' + server + ':8080/praetorapi/' + action,
                  data,
                  { headers: { 'Content-Type': 'application/json' } })
            .then(function (response) {
                return response.data;
            })
            .catch(function (e) {
                return { success: false, message: "Error " + e.status };
            });
              return promise;
          }
      };
      return instance;
  })

  .factory('androidFileOpenerService', function ($http) {

      var instance = {
          openIntent: function (url, mime) {
              window.plugins.webintent.startActivity({
                  action: window.plugins.webintent.ACTION_VIEW,
                  url: url,
                  type: mime
              },
                function () { },
                function (x) {
                    alert(x);
                    alert('Failed to open URL via Android Intent.');
                    console.log("Failed to open URL via Android Intent.")
                }
              );
          },

          downloadFile: function (fileUrl, mimeType, tempName) {

              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getFile(
                    "dummy.html", { create: true, exclusive: false },
                    function gotFileEntry(fileEntry) {
                        sPath = fileEntry.toNativeURL().replace("dummy.html", "");

                        var fileTransfer = new FileTransfer();
                        fileEntry.remove();

                        fileTransfer.download(
                            fileUrl,
                            sPath + tempName,
                            function (theFile) {
                                instance.openIntent(theFile.toNativeURL(), mimeType);
                            },
                            function (error) {
                                alert("download error source " + error.source);
                                alert("download error target " + error.target);
                                alert("upload error code: " + error.code);
                            }
                        );
                    }, function (e) { alert(e); });
                }, function (e) { alert(e); });
          }
      };
      return instance;
  });


//http://forum.ionicframework.com/t/android-look-ionicactionsheet-android-hardware-menu-button/3630/3