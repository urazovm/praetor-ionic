module PraetorApp.Controllers {

    export class HomeSpisyController
        extends BaseController<ViewModels.Home.SpisyViewModel>
        implements PraetorApp.Definitely.ISpisyUtilitiesDataChange {

        public static ID = "HomeSpisyController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", "$state", "$timeout", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.SpisyUtilities.ID, Services.PraetorService.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $state: ng.ui.IStateService;
        private SpisyUtilities: Services.SpisyUtilities;
        public PrehledSpisu: PraetorApp.ViewModels.PrehledSpisuViewModel;
        private PraetorService: Services.PraetorService;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, $timeout: ng.ITimeoutService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, SpisyUtilities: Services.SpisyUtilities, PraetorService: Services.PraetorService) {
            super($scope, ViewModels.Home.SpisyViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.$state = $state;
            this.SpisyUtilities = SpisyUtilities;
            this.SpisyUtilities.register(this);
            this.PraetorService = PraetorService;

            this.viewModel.PrehledSpisu = new PraetorApp.ViewModels.PrehledSpisuViewModel();

            this.LoadLocalData();
            this.changeDataSource();
        }

        private LoadLocalData() {
            this.onBeforeLoading();

            var request = <PraetorServer.Service.WebServer.Messages.LoadDuleziteSpisyRequest>{};
            request.maxPocetPoslednich = 20;

            this.PraetorService.loadDuleziteSpisy(request).then(
                response => {
                    this.viewModel.PrehledSpisu.posledniSpisy = response.posledniSpisy;
                    this.viewModel.PrehledSpisu.oblibeneSpisy = response.oblibeneSpisy;

                    this.onAftterLoading();
                }
                );
        }

        openSpis(spis: PraetorServer.Service.WebServer.Messages.Dto.Spis) {
            // Jako první stránku chceme na spisu otevřít dokumenty.
            setTimeout(() => {
                this.$state.go('app.spis.dokumenty', { id: spis.id_Spis });
                this.scope.$apply();
            }, 100);
        }

        changeDataSource() {                
            // Došlo k změně u registrované komponenty
            // aktualizujeme seznam spisů
            this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
        }

        reloadData() {
            this.onBeforeLoading();
            this.SpisyUtilities.Synchronize();
            this.changeDataSource();
            this.onAftterLoading();

            this.LoadLocalData();
        }
    }
}
