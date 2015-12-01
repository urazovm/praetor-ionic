module PraetorApp.Controllers {

    export class HomeCinnostiController extends BaseController<ViewModels.Home.CinnostiViewModel> {

        public static ID = "HomeCinnostiController";

        public static get $inject(): string[] {
            return ["$scope", Services.PraetorService.ID, Services.UiHelper.ID];
        }

        private PraetorService: Services.PraetorService;
        private UiHelper: Services.UiHelper;
        private DateSince: Date;
        private DateUntil: Date;
        private Cinnosti: PraetorApp.ViewModels.Ekonomika.CinnostPrehledEntry[];

        constructor($scope: ng.IScope, praetorService: Services.PraetorService, uiHelper: Services.UiHelper) {
            super($scope, ViewModels.Home.CinnostiViewModel);

            this.PraetorService = praetorService;
            this.UiHelper = uiHelper;

            var now = new Date();
            this.DateSince = this.AddDays(this.GetDate(now), 1);
            this.DateUntil = this.DateSince;

            var request = <PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest>{};
            request.cinnostiUntil = DateTools.GetDateInJsonFormat(this.DateUntil);
            request.cinnostiSince = DateTools.GetDateInJsonFormat(this.AddDays(this.DateSince, -7));
            this.viewModel.PrehledCinnosti = new PraetorApp.ViewModels.PrehledCinnostiViewModel();
            this.Cinnosti = [];

            this.LoadData(request);
        }

        private AddDays(date: Date, number: number): Date {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + number, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        }

        private GetDate(date: Date): Date {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }

        public reloadData() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest>{};
            request.cinnostiUntil = DateTools.GetDateInJsonFormat(this.DateUntil);
            request.cinnostiSince = DateTools.GetDateInJsonFormat(this.DateSince);

            this.Cinnosti = [];

            this.LoadData(request);
        }

        public RebuildList() {
            var list = new Array<PraetorApp.ViewModels.Ekonomika.CinnostDateGroup>();

            var dateUntil = moment(this.DateUntil);
            var dateSince = dateUntil.clone().add(-1, "days");

            while (dateSince >= moment(this.DateSince)) {
                var datumEntry = new PraetorApp.ViewModels.Ekonomika.CinnostDateGroup();
                datumEntry.datum = dateSince.clone().toDate();
                datumEntry.datumString = dateSince.format("dddd D. M. YYYY");
                datumEntry.cinnosti = _.select(this.Cinnosti, x => moment(x.datum) >= dateSince && moment(x.datum) < dateUntil);
                datumEntry.cas = _.sum(datumEntry.cinnosti, x => x.cas);
                datumEntry.casString = DateTools.FormatAsHourDurationFromMinutes(datumEntry.cas);
                list.push(datumEntry);

                dateUntil = dateSince.clone();
                dateSince = dateSince.add(-1, "days");
            }

            this.viewModel.PrehledCinnosti.Cinnosti = list;
        }

        public LoadData(request: PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest) {

            this.onBeforeLoading();

            this.PraetorService.loadCinnosti(request).then(
                response => {
                    
                    this.Cinnosti = this.Cinnosti.concat(_.map(response.cinnosti, x => {
                        var result = new PraetorApp.ViewModels.Ekonomika.CinnostPrehledEntry();
                        result.cas = x.cas;
                        result.casString = DateTools.FormatAsHourDurationFromMinutes(x.cas);
                        result.datum = DateTools.GetDateTimeFromJsonFormat(x.datum);
                        result.id_TimeSheet = x.id_Cinnost;
                        result.popis = x.popis;
                        result.predmetSpisu = x.predmetSpisu;
                        result.spisovaZnacka = x.spisovaZnacka;
                        result.hlavniKlient = x.hlavniKlient;
                        return result;
                    }));

                    var requestSince = DateTools.GetDateTimeFromJsonFormat(request.cinnostiSince);
                    if (requestSince < this.DateSince)
                        this.DateSince = requestSince;
                    var requestUntil = DateTools.GetDateTimeFromJsonFormat(request.cinnostiUntil);
                    if (requestUntil > this.DateUntil)
                        this.DateUntil = requestUntil;

                    this.RebuildList();

                    this.viewModel.Initialized = true;

                    this.onAftterLoading();
                }
                );
        }

        public LoadPreviousWeek() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadCinnostiRequest>{};
            request.cinnostiUntil = DateTools.GetDateInJsonFormat(this.DateSince);
            request.cinnostiSince = DateTools.GetDateInJsonFormat(this.AddDays(this.DateSince, - 7));

            this.LoadData(request);
        }

        public OpenCinnost(cinnost: PraetorServer.Service.WebServer.Messages.Dto.Cinnost) {
        }

        public CreateDatedCinnost(date: Date) {
            this.UiHelper.showDialog(this.UiHelper.DialogIds.VyberSpisu, new Models.DialogOptions()).then(
                (result: VyberSpisuResult) => {
                    if (!result || !result.Success)
                        return;

                    var id_Spis = result.Id_Spis;
                    var params = new CinnostParams(id_Spis, date);
                    var options = new Models.DialogOptions(params);
                    this.UiHelper.showDialog(this.UiHelper.DialogIds.Cinnost, options).then(
                        (result: CinnostResult) => {
                            if (result && result.Success)
                                this.UiHelper.toast.show("Činnost byla uložena.", "short", "center");
                                this.reloadData();
                        },
                        (ex) => {
                            this.UiHelper.alert("Činnost se nepodařilo uložit.");
                        }
                        );
                }
                );
        }

        public CreateCinnost() {
            this.UiHelper.showDialog(this.UiHelper.DialogIds.VyberSpisu, new Models.DialogOptions()).then(
                (result: VyberSpisuResult) => {
                    if (!result || !result.Success)
                        return;

                    var id_Spis = result.Id_Spis;
                    var params = new CinnostParams(id_Spis);
                    var options = new Models.DialogOptions(params);
                    this.UiHelper.showDialog(this.UiHelper.DialogIds.Cinnost, options).then(
                        (result: CinnostResult) => {
                            if (result && result.Success)
                                this.UiHelper.toast.show("Činnost byla uložena.", "short", "center");
                                this.reloadData();
                        },
                        (ex) => {
                            this.UiHelper.alert("Činnost se nepodařilo uložit.");
                        }
                        );
                }
                );
        }
    }
}
