module PraetorApp.ViewModels.Ekonomika {

    export class TimeSheetViewModel {
        public Data: PraetorServer.Service.WebServer.Messages.Dto.TimeSheet;
        public Aktivity: PraetorServer.Service.WebServer.Messages.Dto.Aktivita[];

        // Vlastnost, pro bindování se na Data.datum.
        public Datum: Date;
        // Vlastnost, pro bindování se na Data.id_Aktivita.
        public Aktivita: PraetorServer.Service.WebServer.Messages.Dto.Aktivita;
    }
}
