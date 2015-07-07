module PraetorApp.Controllers {

    export class HomeVykazovaniController extends BaseController<ViewModels.Home.VykazovaniViewModel> {

        public static ID = "HomeVykazovaniController";

        public static get $inject(): string[]{
            return ["$scope", Services.PraetorService.ID, Services.UiHelper.ID];
        }

        private PraetorService: Services.PraetorService;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, praetorService: Services.PraetorService, uiHelper: Services.UiHelper) {
            super($scope, ViewModels.Home.VykazovaniViewModel);

            this.PraetorService = praetorService;                        
        }

        public test(url)
        {
            this.PraetorService.openFile(url);
        }

        public loadData()
        {
            var cinnosti = this.PraetorService.loadCinnosti();
            // TODO
        }

        public CreateTimeSheet()
        {
            var self = this;

            this.UiHelper.showDialog(this.UiHelper.DialogIds.TimeSheet).then(
                () => {
                    loadData();
                });
            }
        }
    }
}
