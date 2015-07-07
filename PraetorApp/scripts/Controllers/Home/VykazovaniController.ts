module PraetorApp.Controllers {

    export class HomeVykazovaniController extends BaseController<ViewModels.Home.VykazovaniViewModel> {

        public static ID = "HomeVykazovaniController";

        public static get $inject(): string[]{
            return ["$scope", Services.FileUtilities.ID];
        }

        private FileUtilities: Services.FileUtilities;

        constructor($scope: ng.IScope, fileService: Services.FileUtilities) {
            super($scope, ViewModels.Home.VykazovaniViewModel);

            this.FileUtilities = fileService;                        
        }

        public test(url)
        {
            this.FileUtilities.openFile(url);
        }



    }
}
