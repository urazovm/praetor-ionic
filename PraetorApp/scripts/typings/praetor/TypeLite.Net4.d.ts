
 
 

 

/// <reference path="Enums.ts" />

declare module PraetorServer.Service.WebServer.Messages {
	interface Request {
		username: string;
		password: string;
		sessionid: System.Guid;
	}
	interface GetFileTokenRequest extends PraetorServer.Service.WebServer.Messages.Request {
		id_file: System.Guid;
	}
	interface Response {
		success: boolean;
		message: string;
	}
	interface GetFileTokenResponse extends PraetorServer.Service.WebServer.Messages.Response {
		token: System.Guid;
	}
	interface LoadChangedSpisyRequest extends PraetorServer.Service.WebServer.Messages.Request {
		onlyChangedSince: Date;
	}
	interface LoadChangedSpisyResponse extends PraetorServer.Service.WebServer.Messages.Response {
		changedSpisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
	}
	interface LoadCinnostiRequest extends PraetorServer.Service.WebServer.Messages.Request {
		cinnostiSince: Date;
		cinnostiUntil: Date;
	}
	interface LoadCinnostiResponse extends PraetorServer.Service.WebServer.Messages.Response {
		cinnosti: PraetorServer.Service.WebServer.Messages.Dto.CinnostPrehledEntry[];
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
	interface LoadSpisZakladniUdajeRequest extends PraetorServer.Service.WebServer.Messages.Request {
		id_Spis: System.Guid;
	}
	interface LoadSpisZakladniUdajeResponse extends PraetorServer.Service.WebServer.Messages.Response {
		spis: PraetorServer.Service.WebServer.Messages.Dto.Spis;
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
	}
}
declare module System {
	interface Guid {
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
		datum: Date;
		cas: string;
		popis: string;
		spisovaZnacka: string;
		predmetSpisu: string;
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


