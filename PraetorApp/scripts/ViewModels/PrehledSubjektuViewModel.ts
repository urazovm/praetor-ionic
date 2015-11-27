module PraetorApp.ViewModels {

    export class PrehledSubjektuViewModel {
        public vsechnySubjekty: PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry[];
        public subjektyZOblibenychSpisu: PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry[];
    }
}
