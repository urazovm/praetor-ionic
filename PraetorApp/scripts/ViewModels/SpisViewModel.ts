module PraetorApp.ViewModels {

    export class SpisViewModel {
        public id_spis: string;
        dokumenty: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
        spis: PraetorServer.Service.WebServer.Messages.Dto.Spis;
        subjekty: PraetorServer.Service.WebServer.Messages.Dto.SpisSubjekt[];
    }
}
