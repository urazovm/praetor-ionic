module PraetorApp.ViewModels.Ekonomika {

    export class TimeSheetViewModel {
        public Data: PraetorServer.Service.WebServer.Messages.Dto.TimeSheet;
        public Aktivity: PraetorServer.Service.WebServer.Messages.Dto.Aktivita[];
    }
}
