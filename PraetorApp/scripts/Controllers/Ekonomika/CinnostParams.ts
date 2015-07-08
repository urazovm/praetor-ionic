module PraetorApp.Controllers {
    export class CinnostParams {
        public Id_Spis: System.Guid;
        public Date: Date;

        constructor(id_Spis: System.Guid, date?: Date) {
            this.Id_Spis = id_Spis;
            this.Date = date;
        }
    }
}
