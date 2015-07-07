/// <reference path="Enums.ts" />

declare module PraetorServer.Service.WebServer.Messages {
    interface LoadChangedSpisyRequest extends PraetorServer.Service.WebServer.Messages.Request {
        onlyChangedSince: Date;
    }
    interface Request {
        username: string;
        password: string;
        sessionid: System.Guid;
    }
    interface LoadChangedSpisyResponse extends PraetorServer.Service.WebServer.Messages.Response {
        changedSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
    }
    interface Response {
        success: boolean;
        message: string;
    }
    interface LoadCinnostiRequest extends PraetorServer.Service.WebServer.Messages.Request {
        cinnostiSince: Date;
        cinnostiUntil: Date;
    }
    interface LoadCinnostiResponse extends PraetorServer.Service.WebServer.Messages.Response {
        cinnosti: PraetorServer.Service.WebServer.Messages.Dto.TimeSheetPrehledEntry[];
    }
    interface LoadPosledniSpisyRequest extends PraetorServer.Service.WebServer.Messages.Request {
        pocet: number;
    }
    interface LoadPosledniSpisyResponse extends PraetorServer.Service.WebServer.Messages.Response {
        posledniSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
    }
    interface LoadHomeRequest extends PraetorServer.Service.WebServer.Messages.Request {
    }
    interface LoadHomeResponse extends PraetorServer.Service.WebServer.Messages.Response {
    }
    interface LoadTimeSheetRequest extends PraetorServer.Service.WebServer.Messages.Request {
        Id_Spis: System.Guid;
    }
    interface LoadTimeSheetResponse extends PraetorServer.Service.WebServer.Messages.Response {
        aktivity: PraetorServer.Service.WebServer.Messages.Dto.Aktivita[];
        timeSheet: PraetorServer.Service.WebServer.Messages.Dto.TimeSheet;
    }
    interface SaveTimeSheetRequest extends PraetorServer.Service.WebServer.Messages.Request {
        timeSheet: PraetorServer.Service.WebServer.Messages.Dto.TimeSheet;
    }
    interface SaveTimeSheetResponse extends PraetorServer.Service.WebServer.Messages.Response {
    }
    interface LoadSpisRequest extends PraetorServer.Service.WebServer.Messages.Request {
        id_Spis: System.Guid;
        loadSpis: boolean;
        loadDokumenty: boolean;
        loadCinnosti: boolean;
        cinnostiSince: Date;
        cinnostiUntil: Date;
    }
    interface LoadSpisResponse extends PraetorServer.Service.WebServer.Messages.Response {
        spis: PraetorServer.Service.WebServer.Messages.Dto.Spis;
        dokumenty: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
        cinnosti: PraetorServer.Service.WebServer.Messages.Dto.TimeSheetPrehledEntry[];
    }
    interface LoginRequest extends PraetorServer.Service.WebServer.Messages.Request {
    }
    interface LoginResponse extends PraetorServer.Service.WebServer.Messages.Response {
    }
}
declare module System {
    interface Guid {
    }
    interface TimeSpan {
        Ticks: number;
        Days: number;
        Hours: number;
        Milliseconds: number;
        Minutes: number;
        Seconds: number;
        TotalDays: number;
        TotalHours: number;
        TotalMilliseconds: number;
        TotalMinutes: number;
        TotalSeconds: number;
    }
}
declare module PraetorServer.Service.WebServer.Messages.Dto {
    interface SpisPrehledEntry {
        id_Spis: System.Guid;
        spisovaZnacka: string;
        predmet: string;
        hlavniKlient: string;
    }
    interface TimeSheetPrehledEntry {
        id_TimeSheet: System.Guid;
        cas: System.TimeSpan;
        popis: string;
        spisovaZnacka: string;
        predmetSpisu: string;
    }
    interface Aktivita {
        id_Aktivita: System.Guid;
        nazev: string;
        popis: string;
    }
    interface TimeSheet {
        id_Uzivatel: System.Guid;
        id_Spis: System.Guid;
        id_Aktivita: System.Guid;
        datum: Date;
        cas: number;
        popis: string;
    }
    interface Spis {
        id_Spis: System.Guid;
        spisovaZnacka: string;
        predmet: string;
    }
    interface DokumentNode {
        id: System.Guid;
        nazev: string;
        pripona: string;
        mime: string;
        nodes: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
    }
}


