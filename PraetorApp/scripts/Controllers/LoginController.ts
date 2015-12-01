module PraetorApp.Controllers {

    export class LoginController extends BaseController<ViewModels.LoginViewModel> {

        public static ID = "LoginController";

        public static get $inject(): string[] {
            return ["$q", "$scope", "$location", "$http", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.PraetorService.ID, Services.HashUtilities.ID];
        }

        private $q: ng.IQService;
        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private Praetor: Services.PraetorService;
        private Hash: Services.HashUtilities;

        constructor($q: ng.IQService, $scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, Praetor: Services.PraetorService, Hash: Services.HashUtilities) {
            super($scope, ViewModels.LoginViewModel);

            this.$q = $q;
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

        private resolveServerAddress(): ng.IPromise<string> {
            if (this.viewModel.server.match(/^[0-9]*$/)) { // Číslo portu na cloudu.
                return this.$q.when("cloud.praetoris.cz:" + this.viewModel.server);
            }
            else if (!this.viewModel.server.match(/\./)) { // Zkratka, kterou nám vyhodnotí náš server.
                return this.Praetor.resolveServerAbbrev(this.viewModel.server);
            }
            else { // Přímo napsaná adresa uživatelem
                return this.$q.when(this.viewModel.server);
            }
        }

        private showMessage(message: string) {
            //this.UiHelper.alert(message);
            this.viewModel.message = message;
        }

        protected login() {
            if (!this.viewModel.server) {
                this.showMessage("Zadejte adresu serveru");
                return;
            }

            if (!this.viewModel.username) {
                this.showMessage("Zadejte přihlašovací jméno");
                return;
            }

            if (!this.viewModel.password) {
                this.showMessage("Zadejte heslo");
                return;
            }

            this.resolveServerAddress().then(
                (serverAddress) => {
                    this.Praetor.login(serverAddress, this.viewModel.username, this.Hash.md5(this.viewModel.password)).then(
                        (data) => {
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
                                this.showMessage(message);
                            }

                        }
                    )
                },
                (ex: Services.HttpGetException) => {
                    if (!ex || !ex.responded || !ex.response)
                        this.showMessage("Nepodařilo se kontaktovat server. Jste připojeni k internetu?");
                    else if (ex.response.status == 0)
                        this.showMessage("Připojení k serveru není k dispozici.");
                    else if (ex.response.status == 404)
                        this.showMessage("Server nebyl nalezen.");
                    else if (ex.response.status == 500)
                        this.showMessage("Server není dostupný.");
                    else
                        this.showMessage("Chyba vyhledávání serveru: " + ex.response.status + " – " + ex.response.statusText);
                }
            );
        }

        //#endregion
    }
}
