module PraetorApp.Services {

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

            var configure = <ng.IRequestShortcutConfig>{};
            configure.timeout = 4000;
            configure.headers = { 'Content-Type': 'application/json' };

            this.$ionicLoading.show({
                template: '<i class="icon ion-load-c"></i>'
            });

            this.$http.post<PraetorServer.Service.WebServer.Messages.LoginResponse>(
                'http://' + server + '/praetorapi/login',
                data,
                configure)
                .then(response => {

                // Zavřeme dialogové okno
                this.$ionicLoading.hide();
                q.resolve(response.data);

            })
            ['catch'](e => {

                // Zavřeme dialogové okno
                this.$ionicLoading.hide();

                if (e.status == 0) {
                    // Ukončeno timeoutem
                    q.resolve({ success: false, message: "Nepodařilo se připojit k serveru: " + server, sessionId: "" });
                }
                else if (e.status == 401) {
                    q.resolve({ success: false, message: "Zadané uživatelské jméno nebo heslo je neplatné.", sessionId: "" });
                }
                else if (e.status == 500) {
                    q.resolve({ success: false, message: "Server '" + server + "' nebyl nalezen.", sessionId: "" });
                }
                else {
                    q.resolve({ success: false, message: "Chyba " + e.status + " – " + e.message, sessionId: "" });
                }
            });

            return q.promise;
        }


        public getData(action: string, data: any, options?: GetDataOptions): ng.IPromise<PraetorServer.Service.WebServer.Messages.Response> {
            if (!options) {
                options = new GetDataOptions();
                options.ShowMessage = true;

                // odstraníme jen dočasně metodu na načítání
                // nyní je imlementována v točítku nahoře
                options.ShowProgress = false;
            }

            if (options.ShowProgress) {
                this.$ionicLoading.show({
                    template: '<i class="icon ion-load-c"></i>'
                });
            }

            var q = this.$q.defer<PraetorServer.Service.WebServer.Messages.Response>();

            var server = this.Preferences.serverUrl;
            data.username = this.Preferences.username;
            data.password = this.Preferences.password;
            data.sessionId = this.Preferences.sessionId;

            if (data.username == undefined || data.password == undefined || server == undefined) {
                // Přepneme se na login obrazovku
                this.$location.path("/app/login");
                this.$location.replace();
            }

            var configure = <ng.IRequestShortcutConfig>{};
            configure.timeout = 10000;
            configure.headers = { 'Content-Type': 'application/json' };

            if (server.indexOf(":") == -1)
                server = server + ":4025";

            var promise = this.$http.post<PraetorServer.Service.WebServer.Messages.Response>(
                'http://' + server + '/praetorapi/' + action,
                data,
                configure)
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
                , e => {
                // TODO: Sjednotit typ objektu v reject?
                if (options.ShowProgress)
                    this.$ionicLoading.hide();

                (<any>window).lastError = e;
                var qReturn = this.$q.when();

                //if (options.ShowMessage)
                //    qReturn = this.UiHelper.alert(e.status + " " + e.statusText, "Chyba");
                console.log(e.status + " " + e.statusText);

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

        public loadDuleziteSpisy(request: PraetorServer.Service.WebServer.Messages.LoadDuleziteSpisyRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadDuleziteSpisyResponse> {
            return this.getData("LoadDuleziteSpisy", request);
        }

        public loadDuleziteSubjekty(request: PraetorServer.Service.WebServer.Messages.LoadDuleziteSubjektyRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadDuleziteSubjektyResponse> {
            return this.getData("LoadDuleziteSubjekty", request);
        }

        public loadSessionInfo(request: PraetorServer.Service.WebServer.Messages.LoadSessionInfoRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadSessionInfoResponse> {
            return this.getData("LoadSessionInfo", request);
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
