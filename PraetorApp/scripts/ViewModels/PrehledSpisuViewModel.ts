module PraetorApp.ViewModels {

    export class PrehledSpisuViewModel {

        public vsechnySpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
        public posledniSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
        public oblibeneSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
    }
}
