





/// <reference path="Enums.ts" />

declare module PraetorServer.Service.WebServer.Messages {
    interface Request {
        serverAbbrev: string;
        username: string;
        password: string;
        sessionId: System.Guid;
    }
    interface GetFileTokenRequest extends PraetorServer.Service.WebServer.Messages.Request {
        id_file: System.Guid;
    }
    interface Response {
        success: boolean;
        message: string;
        interfaceVersion: number;
    }
    interface GetFileTokenResponse extends PraetorServer.Service.WebServer.Messages.Response {
        token: System.Guid;
    }
    interface LoadChangedSubjektyRequest extends PraetorServer.Service.WebServer.Messages.Request {
        onlyChangedSince: Date;
    }
    interface LoadChangedSubjektyResponse extends PraetorServer.Service.WebServer.Messages.Response {
        changedSubjekty: PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry[];
    }
    interface LoadChangedSpisyRequest extends PraetorServer.Service.WebServer.Messages.Request {
        onlyChangedSince: Date;
    }
    interface LoadChangedSpisyResponse extends PraetorServer.Service.WebServer.Messages.Response {
        changedSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
    }
    interface LoadSessionInfoRequest extends PraetorServer.Service.WebServer.Messages.Request {
    }
    interface LoadSessionInfoResponse extends PraetorServer.Service.WebServer.Messages.Response {
        jmenoUzivatele: string;
        verzeServeru: string;
    }
    interface LoadCinnostiRequest extends PraetorServer.Service.WebServer.Messages.Request {
        cinnostiSince: Date;
        cinnostiUntil: Date;
    }
    interface LoadCinnostiResponse extends PraetorServer.Service.WebServer.Messages.Response {
        cinnosti: PraetorServer.Service.WebServer.Messages.Dto.CinnostPrehledEntry[];
    }
    interface LoadDuleziteSubjektyRequest extends PraetorServer.Service.WebServer.Messages.Request {
    }
    interface LoadDuleziteSubjektyResponse extends PraetorServer.Service.WebServer.Messages.Response {
        subjektyZOblibenychSpisu: PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry[];
    }
    interface LoadDuleziteSpisyRequest extends PraetorServer.Service.WebServer.Messages.Request {
        maxPocetPoslednich: number;
    }
    interface LoadDuleziteSpisyResponse extends PraetorServer.Service.WebServer.Messages.Response {
        posledniSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
        oblibeneSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
    }
    interface LoadHomeRequest extends PraetorServer.Service.WebServer.Messages.Request {
    }
    interface LoadHomeResponse extends PraetorServer.Service.WebServer.Messages.Response {
    }
    interface LoadSpisZakladniUdajeRequest extends PraetorServer.Service.WebServer.Messages.Request {
        id_Spis: System.Guid;
    }
    interface LoadSpisZakladniUdajeResponse extends PraetorServer.Service.WebServer.Messages.Response {
        spis: PraetorServer.Service.WebServer.Messages.Dto.Spis;
        subjekty: PraetorServer.Service.WebServer.Messages.Dto.SpisSubjekt[];
    }
    interface LoadSpisDokumentyRequest extends PraetorServer.Service.WebServer.Messages.Request {
        id_Spis: System.Guid;
    }
    interface LoadSpisDokumentyResponse extends PraetorServer.Service.WebServer.Messages.Response {
        dokumenty: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
    }
    interface LoadCinnostRequest extends PraetorServer.Service.WebServer.Messages.Request {
        id_Spis: System.Guid;
    }
    interface LoadCinnostResponse extends PraetorServer.Service.WebServer.Messages.Response {
        aktivity: PraetorServer.Service.WebServer.Messages.Dto.Aktivita[];
        cinnost: PraetorServer.Service.WebServer.Messages.Dto.Cinnost;
    }
    interface SaveCinnostRequest extends PraetorServer.Service.WebServer.Messages.Request {
        cinnost: PraetorServer.Service.WebServer.Messages.Dto.Cinnost;
    }
    interface SaveCinnostResponse extends PraetorServer.Service.WebServer.Messages.Response {
    }
    interface LoadSpisCinnostiRequest extends PraetorServer.Service.WebServer.Messages.Request {
        id_Spis: System.Guid;
        cinnostiSince: Date;
        cinnostiUntil: Date;
    }
    interface LoadSpisCinnostiResponse extends PraetorServer.Service.WebServer.Messages.Response {
        cinnosti: PraetorServer.Service.WebServer.Messages.Dto.CinnostPrehledEntry[];
    }
    interface LoginRequest extends PraetorServer.Service.WebServer.Messages.Request {
    }
    interface LoginResponse extends PraetorServer.Service.WebServer.Messages.Response {
        sessionId: System.Guid;
    }
}
declare module System {
    interface Guid {
    }
}
declare module PraetorServer.Service.WebServer.Messages.Dto {
    interface SubjektPrehledEntry {
        id_Subjekt: System.Guid;
        oznaceni: string;
        stitky: string;
        primarniTelefon: string;
        primarniEmail: string;
    }
    interface SpisPrehledEntry {
        id_Spis: System.Guid;
        spisovaZnacka: string;
        predmet: string;
        hlavniKlient: string;
        protistrana: string;
        jeOblibeny: boolean;
    }
    interface CinnostPrehledEntry {
        id_Cinnost: System.Guid;
        datum: Date;
        cas: number;
        popis: string;
        spisovaZnacka: string;
        predmetSpisu: string;
        hlavniKlient: string;
    }
    interface Spis {
        id_Spis: System.Guid;
        spisovaZnacka: string;
        predmet: string;
        hlavniKlient: string;
        klient: string;
        protistrana: string;
        stav: string;
        stitky: string;
        pravniKategorie: string;
        procesniStav: string;
        poznamka: string;
        odpovednyAdvokat: string;
        zpracovatel: string;
    }
    interface SpisSubjekt {
        role: string;
        procesniRole: string;
        hmotnepravniRole: string;
        jeHlavniKlient: boolean;
        oznaceni: string;
        stitky: string;
        primarniTelefon: string;
        primarniEmail: string;
        spojeni: PraetorServer.Service.WebServer.Messages.Dto.Spojeni[];
    }
    interface Spojeni {
        jePreferovane: boolean;
        spojeni: string;
        idTypSpojeni: System.Guid;
    }
    interface DokumentNode {
        id: System.Guid;
        nazev: string;
        pripona: string;
        mime: string;
        nodes: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
    }
    interface Aktivita {
        id_Aktivita: System.Guid;
        nazev: string;
        popis: string;
        ord: number;
    }
    interface Cinnost {
        id_Spis: System.Guid;
        spisOznaceni: string;
        id_Aktivita: System.Guid;
        datum: Date;
        cas: number;
        popis: string;
    }
}


