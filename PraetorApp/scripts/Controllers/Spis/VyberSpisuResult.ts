module PraetorApp.Controllers {
    export class VyberSpisuResult {
        public Success: boolean;
        public Id_Spis: System.Guid;

        constructor(success: boolean, id_Spis: System.Guid) {
            this.Success = success;
            this.Id_Spis = id_Spis;
        }
    }
}
