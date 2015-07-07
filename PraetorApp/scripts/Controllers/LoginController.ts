module PraetorApp.Controllers {

    export class LoginController extends BaseController<ViewModels.LoginViewModel> {

        public static ID = "LoginController";

        public static get $inject(): string[]{
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
            this.viewModel.server = Preferences.serverUrl;
            this.viewModel.username = Preferences.username;

            $scope.$on("http.unauthorized", _.bind(this.http_unauthorized, this));
            $scope.$on("http.forbidden", _.bind(this.http_forbidden, this));
            $scope.$on("http.notFound", _.bind(this.http_notFound, this));
        }

        //#region Event Handlers

        private http_unauthorized() {

            // Unauthorized should mean that a token wasn't sent, but we'll null these out anyways.
            this.Preferences.username = null;
            this.Preferences.token = null;

            this.UiHelper.toast.showLongBottom("You do not have a token (401); please login.");
        }

        private http_forbidden() {

            // A token was sent, but was no longer valid. Null out the invalid token.
            this.Preferences.username = null;
            this.Preferences.token = null;

            this.UiHelper.toast.showLongBottom("Your token has expired (403); please login again.");
        }

        private http_notFound() {
            // The restful API services are down maybe?
            this.UiHelper.toast.showLongBottom("Server not available (404); please contact your administrator.");
        }

        //#endregion

        //#region Controller Methods

        protected login() {
            var self = this;

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

            this.UiHelper.progressIndicator.showSimple(true);            

            this.Praetor.login(this.viewModel.server, this.viewModel.username, this.Hash.md5(this.viewModel.password)).then(function (data) {
                // Odstraníme 
                self.UiHelper.progressIndicator.hide();                
                if (data.success) {
                    self.Preferences.serverUrl = self.viewModel.server;
                    self.Preferences.username = self.viewModel.username;
                    self.Preferences.password = self.Hash.md5(self.viewModel.password);

                    self.$location.path("/app/home");
                    self.$location.replace();
                }
                else {                    
                    self.UiHelper.alert("Chyba přihlášení");
                }

            })['finally'](function () {
                // Zavřeme progress indigator                
                self.UiHelper.progressIndicator.hide();
            });
        }

        //#endregion
    }
}
