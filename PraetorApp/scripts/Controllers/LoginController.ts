module PraetorApp.Controllers {

    export class LoginController extends BaseController<ViewModels.LoginViewModel> {

        public static ID = "LoginController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.PraetorService.ID, Services.HashUtilities.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private Praetor: Services.PraetorService;
        private Hash: Services.HashUtilities;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, Praetor: Services.PraetorService, Hash: Services.HashUtilities) {
            super($scope, ViewModels.LoginViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.Praetor = Praetor;
            this.Hash = Hash;

            // vyplníme poslední uložený server a login
            this.viewModel.server = Preferences.serverName;
            this.viewModel.username = Preferences.username;

            $scope.$on("http.unauthorized", _.bind(this.http_unauthorized, this));
            $scope.$on("http.forbidden", _.bind(this.http_forbidden, this));
            $scope.$on("http.notFound", _.bind(this.http_notFound, this));
        }

        //#region Event Handlers

        private http_unauthorized() {

            // Unauthorized should mean that a token wasn't sent, but we'll null these out anyways.
            this.Preferences.username = null;
            this.Preferences.sessionId = null;

            this.UiHelper.toast.showLongBottom("You do not have a token (401); please login.");
        }

        private http_forbidden() {

            // A token was sent, but was no longer valid. Null out the invalid token.
            this.Preferences.username = null;
            this.Preferences.sessionId = null;

            this.UiHelper.toast.showLongBottom("Your token has expired (403); please login again.");
        }

        private http_notFound() {
            // The restful API services are down maybe?
            this.UiHelper.toast.showLongBottom("Server not available (404); please contact your administrator.");
        }

        //#endregion

        //#region Controller Methods

        private httpGet(theUrl: string): string {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false); // false for synchronous request
            xmlHttp.send(null);
            if (xmlHttp.status == 200)
                return xmlHttp.responseText;
            else
                return "";
        }

        protected login() {
            if (!this.viewModel.server) {
                this.UiHelper.alert("Zadejte adresu serveru");
                return;
            }

            if (!this.viewModel.username) {
                this.UiHelper.alert("Zadejte přihlašovací jméno");
                return;
            }

            if (!this.viewModel.password) {
                this.UiHelper.alert("Zadejte heslo");
                return;
            }

            var serverAddress = "";
            var zkratkaNenalezena = false;

            if (serverAddress == "" && this.viewModel.server.match(/^[0-9]*$/)) { // Číslo portu na cloudu.
                serverAddress = "cloud.praetoris.cz:" + this.viewModel.server;
            }
            if (serverAddress == "" && !this.viewModel.server.match(/\./)) { // Zkratka, kterou nám vyhodnotí náš server.
                serverAddress = this.httpGet("http://update.praetoris.cz/config/client/mobile/address/" + this.viewModel.server.toLowerCase());
                if (serverAddress == "")
                    zkratkaNenalezena = true;
            }
            if (serverAddress == "") {
                serverAddress = this.viewModel.server;
            }

            this.Praetor.login(serverAddress, this.viewModel.username, this.Hash.md5(this.viewModel.password)).then((data) => {
                if (data.success) {
                    this.Preferences.serverName = this.viewModel.server;
                    this.Preferences.serverUrl = serverAddress;
                    this.Preferences.username = this.viewModel.username;
                    this.Preferences.password = this.Hash.md5(this.viewModel.password);
                    this.Preferences.sessionId = <any>data.sessionId;

                    this.$location.path("/app/home");
                    this.$location.replace();
                }
                else {
                    var message = data.message;
                    if (zkratkaNenalezena) {
                        message += " Zadaná adresa serveru byla vyhodnocena jako zkratka, ale nezdařil se její překlad. Zkuste zadat přímou adresu serveru.";
                    }
                    this.UiHelper.alert(message);
                }

            }
            )['finally'](function () {

            });
        }

        //#endregion
    }
}
