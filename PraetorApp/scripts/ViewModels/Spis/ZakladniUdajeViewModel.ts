module PraetorApp.ViewModels.Spis {

    export class ZakladniUdajeViewModel {
        public id_spis: string;
        spis: PraetorServer.Service.WebServer.Messages.Dto.Spis;
        subjekty: PraetorServer.Service.WebServer.Messages.Dto.SpisSubjekt[];
    }
}
