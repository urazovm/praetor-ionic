angular.module('praetor.praetorService', [])
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