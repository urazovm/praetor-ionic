module PraetorApp.Controllers {
    export class TimeSheetParams {
        public Id_Spis: System.Guid;

        constructor(id_Spis: System.Guid) {
            this.Id_Spis = id_Spis;
        }
    }
}
