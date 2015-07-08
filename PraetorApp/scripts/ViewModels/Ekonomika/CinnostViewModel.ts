module PraetorApp.ViewModels.Ekonomika {

    export class CinnostViewModel {
        public Data: PraetorServer.Service.WebServer.Messages.Dto.Cinnost;
        public Aktivity: PraetorServer.Service.WebServer.Messages.Dto.Aktivita[];

        // Vlastnost, pro bindování se na Data.datum.
        public Datum: Date;
        // Vlastnost, pro bindování se na Data.id_Aktivita.
        public Aktivita: PraetorServer.Service.WebServer.Messages.Dto.Aktivita;
    }
}
