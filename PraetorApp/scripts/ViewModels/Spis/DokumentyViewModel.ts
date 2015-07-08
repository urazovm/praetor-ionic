module PraetorApp.ViewModels.Spis {

    export class DokumentyViewModel {
        public id_spis: string;
        dokumenty: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
    }
}
