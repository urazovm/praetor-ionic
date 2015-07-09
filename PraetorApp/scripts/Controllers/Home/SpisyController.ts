module PraetorApp.Controllers {

    export class HomeSpisyController
        extends BaseController<ViewModels.Home.SpisyViewModel>
        implements PraetorApp.Definitely.ISpisyUtilitiesDataChange {

        public static ID = "HomeSpisyController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", "$state", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.SpisyUtilities.ID, Services.PraetorService.ID];
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

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, SpisyUtilities: Services.SpisyUtilities, PraetorService: Services.PraetorService) {
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

            this.LoadPosledniSpisy();

            this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
        }

        private LoadPosledniSpisy() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadPosledniSpisyRequest>{};
            request.pocet = 20;

            this.PraetorService.LoadPosledniSpisy(request).then(
                response => {
                    this.viewModel.PrehledSpisu.posledniSpisy = response.posledniSpisy;
                }
                );
        }

        openSpis(spis: PraetorServer.Service.WebServer.Messages.Dto.Spis) {
            // Otevřeme detail spisu            
            setTimeout(() => {
                this.$state.go('app.spis.zakladniudaje', { id: spis.id_Spis });
                this.scope.$apply();
            }, 100);
        }

        changeDataSource() {                
            // Došlo k změně u registrované komponenty
            // aktualizujeme seznam spisů
            this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
        }
    }
}
