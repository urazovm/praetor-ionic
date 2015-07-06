/// <reference path="Enums.ts" />
declare module PraetorServer.Service.WebServer.Messages {
    interface LoadHomeRequest extends PraetorServer.Service.WebServer.Messages.Request {
        loadVsechnySpisy: boolean;
        loadPosledniSpisy: boolean;
        pocetPoslednichSpisu: number;
        loadCinnosti: boolean;
        cinnostiSince: Date;
        cinnostiUntil: Date;
    }
    interface Request {
        username: string;
        password: string;
        sessionid: System.Guid;
    }
    interface LoadHomeResponse extends PraetorServer.Service.WebServer.Messages.Response {
        vsechnySpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
        posledniSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
        cinnosti: PraetorServer.Service.WebServer.Messages.Dto.CinnostPrehledEntry[];
    }
    interface Response {
        success: boolean;
        message: string;
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
        success: boolean;
        spis: PraetorServer.Service.WebServer.Messages.Dto.Spis;
        dokumenty: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
        cinnosti: PraetorServer.Service.WebServer.Messages.Dto.CinnostPrehledEntry[];
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
    interface CinnostPrehledEntry {
        id_Cinnost: System.Guid;
        cas: System.TimeSpan;
        popis: string;
        spisovaZnacka: string;
        predmetSpisu: string;
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


