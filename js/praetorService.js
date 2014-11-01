//test
angular.module('praetor.praetorService', [])
  .factory('praetorService', function ($http) {
      var instance = {

          // calls 
          login: function () {
              return instance.getdata("login", {});
          },

          loadHome: function (request) {
              return instance.getdata("loadhome", request);
          },

          loadSpis: function (request) {
              return instance.getdata("loadspis", request);
          },







          // Staré volání
          getSpis: function (id) {
              return instance.getdata("getspis", { "id_spis": id });
          },
          getSpisy: function () {
              return instance.getdata("getspisy", {});
          },
          getFileToken: function (id) {
              return instance.getdata("getfiletoken", { id_file: id });
          },
          getdata: function (action, data) {
              var server = window.localStorage.getItem('server');
              var username = window.localStorage.getItem('username');
              var password = window.localStorage.getItem('password');

              data.username = username;
              data.password = password;

              var promise = $http.post(
                  'http://' + server + '/praetorapi/' + action,
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
          downloadFile: function (fileUrl, mimeType, tempName, onprogress) {

              console.log("init download: " + fileUrl + ", " + mimeType);

              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getFile(
                    "dummy.html", { create: true, exclusive: false },
                    function gotFileEntry(fileEntry) {
                        sPath = fileEntry.toNativeURL().replace("dummy.html", "");

                        var fileTransfer = new FileTransfer();
                        fileEntry.remove();
                        console.log("download: " + fileUrl + ", " + mimeType);
                        var increment = 0;
                        var incrementText = "";
                        fileTransfer.onprogress = function (progressEvent) {
                            if (progressEvent.lengthComputable) {
                                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                                onprogress(perc + "%");
                            } else {
                                
                                if (increment == 0) {
                                    incrementText = "Loading.";
                                } else {
                                    incrementText += ".";
                                }
                                onprogress(incrementText);
                                increment++;
                                if (increment > 3)
                                    increment = 0;
                            }
                        };

                        fileTransfer.download(
                            fileUrl,
                            sPath + tempName,
                            function (theFile) {
                                onprogress("");
                                console.log("download complet: " + theFile.toNativeURL() + ", " + mimeType);
                                window.plugins.webintent.startActivity({
                                    action: window.plugins.webintent.ACTION_VIEW,
                                    url: theFile.toNativeURL(),
                                    type: mimeType
                                },
                                function () { },
                                function (x) {
                                    onprogress("");
                                    alert(x);
                                    alert('Failed to open URL via Android Intent.');
                                    console.log("Failed to open URL via Android Intent.")
                                }
                              );
                            },
                            function (error) {
                                onprogress("");
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