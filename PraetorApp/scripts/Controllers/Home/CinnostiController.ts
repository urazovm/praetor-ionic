module PraetorApp.Controllers {

    export class HomeCinnostiController extends BaseController<ViewModels.Home.CinnostiViewModel> {

        public static ID = "HomeCinnostiController";

        public static get $inject(): string[] {
            return ["$scope", Services.PraetorService.ID, Services.PraetorService.ID, Services.UiHelper.ID];
        }

        private PraetorService: Services.PraetorService;
        private FileUtilities: Services.FileUtilities;
        private UiHelper: Services.UiHelper;
        private DateSince: Date;
        private DateUntil: Date;
        private Cinnosti: PraetorApp.ViewModels.Ekonomika.CinnostPrehledEntry[];

        constructor($scope: ng.IScope, praetorService: Services.PraetorService, fileService: Services.FileUtilities, uiHelper: Services.UiHelper) {
            super($scope, ViewModels.Home.CinnostiViewModel);

            this.PraetorService = praetorService;
            this.FileUtilities = fileService;
            this.UiHelper = uiHelper;

            var now = new Date();
            this.DateSince = this.AddDays(this.GetDate(now), 1);
            this.DateUntil = this.DateSince;

            var request = <PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest>{};
            request.cinnostiUntil = <any>this.DateUntil.toJSON();
            request.cinnostiSince = <any>this.AddDays(this.DateSince, -1).toJSON();
            this.viewModel.PrehledCinnosti = new PraetorApp.ViewModels.PrehledCinnostiViewModel();
            this.Cinnosti = [];

            this.LoadData(request);
        }

        public test(url) {
            this.FileUtilities.openFile(url);
        }

        private AddDays(date: Date, number: number): Date {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + number, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        }

        private GetDate(date: Date): Date {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }

        public ReloadData() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest>{};
            request.cinnostiUntil = <any>this.DateUntil.toJSON();
            request.cinnostiSince = <any>this.DateSince.toJSON();

            this.Cinnosti = [];

            this.LoadData(request);
        }

        public RebuildList() {
            var list = new Array<PraetorApp.ViewModels.Ekonomika.CinnostDateGroup>();

            for (var i = 0; i < this.Cinnosti.length; i++) {
                var currentDatum = this.GetDate(this.Cinnosti[i].datum);
                var datumEntry = _.find(list, x => x.datum.getTime() == currentDatum.getTime());
                if (!datumEntry) {
                    datumEntry = new PraetorApp.ViewModels.Ekonomika.CinnostDateGroup();
                    datumEntry.datum = currentDatum;
                    datumEntry.datumString = currentDatum.toLocaleDateString();
                    datumEntry.cinnosti = new Array<PraetorApp.ViewModels.Ekonomika.CinnostPrehledEntry>();
                    list.push(datumEntry);
                }
                datumEntry.cinnosti.push(this.Cinnosti[i]);
            }

            this.viewModel.PrehledCinnosti.Cinnosti = _.sortBy(list, x => x.datum).reverse();
        }

        public LoadData(request: PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest) {
            this.PraetorService.loadCinnosti(request).then(
                response => {
                    this.Cinnosti = this.Cinnosti.concat(_.map(response.cinnosti, x => {
                        var result = new PraetorApp.ViewModels.Ekonomika.CinnostPrehledEntry();
                        result.cas = <any>x.cas;
                        result.datum = new Date(<any>x.datum);
                        result.id_TimeSheet = x.id_Cinnost;
                        result.popis = x.popis;
                        result.predmetSpisu = x.predmetSpisu;
                        result.spisovaZnacka = x.spisovaZnacka;
                        return result;
                    }));

                    var requestSince = new Date(<any>request.cinnostiSince);
                    if (requestSince < this.DateSince)
                        this.DateSince = requestSince;
                    var requestUntil = new Date(<any>request.cinnostiUntil);
                    if (requestUntil > this.DateUntil)
                        this.DateUntil = requestUntil;

                    this.RebuildList();
                }
                );
        }

        public LoadPreviousDay() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest>{};
            request.cinnostiUntil = <any>this.DateSince.toJSON();
            request.cinnostiSince = <any>this.AddDays(this.DateSince, - 1).toJSON();

            this.LoadData(request);
        }

        public OpenCinnost(cinnost: PraetorServer.Service.WebServer.Messages.Dto.Cinnost) {
        }

        public CreateDatedCinnost(date: Date) {
            this.UiHelper.showDialog(this.UiHelper.DialogIds.VyberSpisu, new Models.DialogOptions()).then(
                (result: VyberSpisuResult) => {
                    if (!result.Success)
                        return;

                    var id_Spis = result.Id_Spis;
                    var params = new CinnostParams(id_Spis, date);
                    var options = new Models.DialogOptions(params);
                    this.UiHelper.showDialog(this.UiHelper.DialogIds.Cinnost, options).then(
                        () => {
                            this.ReloadData();
                        }
                        );
                }
                );
        }

        public CreateCinnost() {
            this.UiHelper.showDialog(this.UiHelper.DialogIds.VyberSpisu, new Models.DialogOptions()).then(
                (result: VyberSpisuResult) => {
                    if (!result.Success)
                        return;

                    var id_Spis = result.Id_Spis;
                    var params = new CinnostParams(id_Spis);
                    var options = new Models.DialogOptions(params);
                    this.UiHelper.showDialog(this.UiHelper.DialogIds.Cinnost, options).then(
                        () => {
                            this.ReloadData();
                        }
                        );
                }
                );
        }
    }
}
