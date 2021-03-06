﻿module PraetorApp.ViewModels.Ekonomika {
    export class CinnostPrehledEntry {
        public id_TimeSheet: System.Guid; // Přenos: string; Server: Guid
        public datum: Date; // Přenos: string; Server: DateTime
        public cas: number;
        public casString: string;
        public popis: string;
        public spisovaZnacka: string;
        public predmetSpisu: string;
        public hlavniKlient: string;
    }
}
