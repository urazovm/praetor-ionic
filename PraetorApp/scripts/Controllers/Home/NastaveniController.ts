module PraetorApp.Controllers {

    export class HomeNastaveniController
        extends BaseController<ViewModels.Home.NastaveniViewModel> {

        public static ID = "HomeNastaveniController";

        public static get $inject(): string[] {
            return ["$scope", "$state", Services.Preferences.ID, Services.PraetorService.ID, "versionInfo"];
        }

        private $state: ng.ui.IStateService;
        private Preferences: Services.Preferences;
        private PraetorService: Services.PraetorService;
        private VersionInfo: Interfaces.VersionInfo;

        constructor($scope: ng.IScope, $state: ng.ui.IStateService, Preferences: Services.Preferences, PraetorService: Services.PraetorService, VersionInfo: Interfaces.VersionInfo) {
            super($scope, ViewModels.Home.NastaveniViewModel);

            this.$state = $state;
            this.Preferences = Preferences;
            this.PraetorService = PraetorService;
            this.VersionInfo = VersionInfo;

            this.loadSessionInfo();
        }

        logout() {
            this.Preferences.password = null;
            this.$state.go("app.login");
        }

        loadSessionInfo() {
            this.viewModel.ServerName = this.Preferences.serverName;
            this.viewModel.ServerUrl = this.Preferences.serverUrl;
            this.viewModel.UserLogin = this.Preferences.username;
            this.viewModel.ApplicationVersion = this.VersionInfo.versionString;

            this.onBeforeLoading();
            var request = <PraetorServer.Service.WebServer.Messages.LoadSessionInfoRequest>{};
            this.PraetorService.loadSessionInfo(request).then((response) => {
                this.viewModel.ServerVersion = response.verzeServeru;
                this.viewModel.UserName = response.jmenoUzivatele;
                this.onAftterLoading();
            });
        }

        reloadData() {
            this.loadSessionInfo();
        }
    }
}
