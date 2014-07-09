
angular.module('starter.praetorService', [])
  .factory('praetorService', function ($http) {
      var instance = {

          // static data
          recent: {},
          currentSpis: {},

          // calls 
          login: function (server, username, password) {
              //var promise = $http.get('http://' + server + ':8080/api/praetorionic/getlogin?username=' + username + '&password=' + password + '')

              var requestData = {"username":username, "password":password}

              var promise = $http.post(
                  'http://' + server + ':8080/praetorapi/login',
                  requestData,
                  { headers: { 'Content-Type': 'application/json' } })
            .then(function (response) {
                debugger;
                if (response.data.success) {
                    instance.recent = response.data
                }
                return response.data;
            })
            .catch(function (e) {
                return { success: false, message: "Error " + e.status };
            });
              return promise;
          },

          getSpis: function (id) {
              console.log("getSpis " + id);
              var promise = $http.post('http://localhost:888/getSpis?callback=JSON_CALLBACK', { id: id }).then(function (response) {
                  //console.log(response.data);
                  instance.currentSpis = response.data;
                  return response.data;
              });
              return promise;
          },



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

          downloadFile: function instance(fileUrl, mimeType, tempName) {

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
                                service.openIntent(theFile.toNativeURL(), mimeType);
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