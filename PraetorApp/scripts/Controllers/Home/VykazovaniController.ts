module PraetorApp.Controllers {

    export class HomeVykazovaniController extends BaseController<ViewModels.Home.VykazovaniViewModel> {

        public static ID = "HomeVykazovaniController";

        public static get $inject(): string[]{
            return ["$scope", Services.PraetorService.ID];
        }

        private PraetorService: Services.PraetorService;

        constructor($scope: ng.IScope, praetorService: Services.PraetorService) {
            super($scope, ViewModels.Home.VykazovaniViewModel);

            this.PraetorService = praetorService;                        
        }

        public test(url)
        {
            this.PraetorService.openFile(url);
        }



    }
}
