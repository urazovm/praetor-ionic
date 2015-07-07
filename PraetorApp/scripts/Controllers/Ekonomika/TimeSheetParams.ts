module PraetorApp.Controllers.Ekonomika {
    export class TimeSheetParams {
        public Id_Spis: System.Guid;

        constructor(id_Spis: System.Guid) {
            this.Id_Spis = id_Spis;
        }
    }
}
