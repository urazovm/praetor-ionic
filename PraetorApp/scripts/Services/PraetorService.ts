module PraetorApp.Services {

    export class PraetorService {

        public static ID = "PraetorService";

        public static get $inject(): string[] {
            return ["$q", Utilities.ID, "$http", "$location", Services.Preferences.ID];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;
        private $http: ng.IHttpService;
        private Preferences: Services.Preferences;
        private $location: ng.ILocationService;

        constructor($q: ng.IQService, Utilities: Utilities, $http: ng.IHttpService, $location: ng.ILocationService, Preferences: Services.Preferences) {
            this.$q = $q;
            this.$http = $http;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.$location = $location;
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

        public getData(action: string, data: any): ng.IPromise<PraetorServer.Service.WebServer.Messages.Response> {

            var q = this.$q.defer<PraetorServer.Service.WebServer.Messages.Response>();

            var server = this.Preferences.serverUrl;
            data.username = this.Preferences.username;
            data.password = this.Preferences.password;

            if (data.username == undefined || data.password == undefined || server == undefined) {
                // Přepneme se na login obrazovku
                this.$location.path("/app/login");
                this.$location.replace();
            }

            var promise = this.$http.post(
                'http://' + server + '/praetorapi/' + action,
                data,
                { headers: { 'Content-Type': 'application/json' } })
                .then(function (response: any) {                
                q.resolve(response.data);
            })
            ['catch'](function (e) {                
                q.resolve({ success: false, message: "Error " + e.status });
            });

            return q.promise;
        }

        public loadCinnosti(request: PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadCinnostiResponse> {
            return this.getData("LoadCinnosti", request);
        }

        public loadTimeSheet(request: PraetorServer.Service.WebServer.Messages.LoadTimeSheetRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoadTimeSheetResponse> {
            return this.getData("LoadTimeSheet", request);
        }

        public SaveTimeSheet(request: PraetorServer.Service.WebServer.Messages.SaveTimeSheetRequest): ng.IPromise<PraetorServer.Service.WebServer.Messages.SaveTimeSheetResponse> {
            return this.getData("SaveTimeSheet", request);
        }
    }
}
