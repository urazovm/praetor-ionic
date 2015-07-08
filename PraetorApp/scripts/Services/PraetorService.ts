﻿module PraetorApp.Services {

    export class PraetorService {

        public static ID = "PraetorService";

        public static get $inject(): string[] {
            return ["$q", Utilities.ID, "$http", "$location", "$ionicLoading", Services.Preferences.ID, UiHelper.ID];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;
        private $http: ng.IHttpService;
        private Preferences: Services.Preferences;
        private $location: ng.ILocationService;
        private UiHelper: UiHelper;
        private $ionicLoading: any;

        constructor($q: ng.IQService, Utilities: Utilities, $http: ng.IHttpService, $location: ng.ILocationService, $ionicLoading: any, Preferences: Services.Preferences, UiHelper: UiHelper) {
            this.$q = $q;
            this.$http = $http;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.$location = $location;
            this.UiHelper = UiHelper;
            this.$ionicLoading = $ionicLoading;
        }

        public loadHome(request: any): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadHomeResponse> {

            var q = this.$q.defer<PraetorServer.Service.WebServer.Messages.LoadHomeResponse>();

            return q.promise;
        }

        public login(server: string, username: string, password: string): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoginResponse> {

            var q = this.$q.defer<PraetorServer.Service.WebServer.Messages.LoginResponse>();

            var data = { username: username, password: password };

            this.$http.post(
                'http://' + server + '/praetorapi/login',
                data,
                {
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(function (response: ng.IHttpPromiseCallbackArg<PraetorServer.Service.WebServer.Messages.LoginResponse>) {
                q.resolve(response.data);
            })
            ['catch'](function (e) {
                q.resolve({ success: false, message: "Error " + e.status + "|" + e.message });
            });

            return q.promise;
        }


        public getData(action: string, data: any, options?: GetDataOptions): ng.IPromise<PraetorServer.Service.WebServer.Messages.Response> {
            if (!options) {
                options = new GetDataOptions();
                options.ShowMessage = true;
                options.ShowProgress = true;
            }

            if (options.ShowProgress) {
                this.$ionicLoading.show({
                    template: '<i class="icon ion-loading-c"></i>'
                });
            }

            var q = this.$q.defer<PraetorServer.Service.WebServer.Messages.Response>();

            var server = this.Preferences.serverUrl;
            data.username = this.Preferences.username;
            data.password = this.Preferences.password;

            if (data.username == undefined || data.password == undefined || server == undefined) {
                // Přepneme se na login obrazovku
                this.$location.path("/app/login");
                this.$location.replace();
            }

            var promise = this.$http.post<PraetorServer.Service.WebServer.Messages.Response>(
                'http://' + server + '/praetorapi/' + action,
                data,
                { headers: { 'Content-Type': 'application/json' } })
                .then(response => {

                if (options.ShowProgress) {
                    this.$ionicLoading.hide();
                }

                var responseData = response.data
                if (responseData.success) {
                    q.resolve(response.data);
                }
                else {
                    if (options.ShowMessage)
                        this.UiHelper.alert(responseData.message);
                    q.reject(responseData);
                }
            }
                )
            ['catch'](e => {
                // TODO: Sjednotit typ objektu v reject?
                if (options.ShowProgress)
                    this.$ionicLoading.hide();

                var qReturn = this.$q.when();

                if (options.ShowMessage)
                    qReturn = this.UiHelper.alert("Error " + e.status);

                qReturn.then(() => {
                    q.reject(e);
                });
            });

            return q.promise;
        }

        public loadCinnosti(request: PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadCinnostiResponse> {
            return this.getData("LoadCinnosti", request);
        }

        public loadCinnost(request: PraetorServer.Service.WebServer.Messages.LoadCinnostRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadCinnostResponse> {
            return this.getData("LoadCinnost", request);
        }

        public SaveCinnost(request: PraetorServer.Service.WebServer.Messages.SaveCinnostRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.SaveCinnostResponse> {
            return this.getData("SaveCinnost", request);
        }

        public getFileToken(request: PraetorServer.Service.WebServer.Messages.GetFileTokenRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.GetFileTokenResponse> {
            return this.getData("getfiletoken", request);
        }

        public loadSpisDokumenty(request: PraetorServer.Service.WebServer.Messages.LoadSpisDokumentyRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadSpisDokumentyResponse> {
            return this.getData("loadspisdokumenty", request);
        }

        public loadSpisZakladniUdaje(request: PraetorServer.Service.WebServer.Messages.LoadSpisZakladniUdajeRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadSpisZakladniUdajeResponse> {
            return this.getData("loadspiszakladniudaje", request);
        }
    }

    class GetDataOptions {
        public ShowMessage: boolean;
        public ShowProgress: boolean;
    }
}
