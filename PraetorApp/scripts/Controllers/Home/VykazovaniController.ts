module PraetorApp.Controllers {

    export class HomeVykazovaniController extends BaseController<ViewModels.Home.VykazovaniViewModel> {

        public static ID = "HomeVykazovaniController";

        public static get $inject(): string[]{
            return ["$scope", Services.PraetorService.ID, Services.PraetorService.ID, Services.UiHelper.ID];
        }

        private PraetorService: Services.PraetorService;
        private FileUtilities: Services.FileUtilities;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, praetorService: Services.PraetorService, fileService: Services.FileUtilities, uiHelper: Services.UiHelper) {
            super($scope, ViewModels.Home.VykazovaniViewModel);

            this.PraetorService = praetorService;
            this.FileUtilities = fileService;
            this.UiHelper = uiHelper;
        }

        public test(url)
        {
            this.FileUtilities.openFile(url);
        }

        public loadData()
        {
            // TODO
        }

        public CreateTimeSheet()
        {
            var self = this;

            // TODO: načíst ID spisu z dialogu.
            var id_Spis = "e84dc039-7bfb-4b6d-846a-00ab7cb7bc10";
            var params = new TimeSheetParams(id_Spis);
            var options = new Models.DialogOptions(params);
            this.UiHelper.showDialog(this.UiHelper.DialogIds.TimeSheet, options).then(
                () => {
                    this.loadData();
                }
            );
        }
    }
}
