
 
 

 

/// <reference path="Enums.ts" />

declare module PraetorServer.Service.WebServer.Messages {
	interface Request {
		username: string;
		password: string;
		sessionid: System.Guid;
	}
	interface Response {
		success: boolean;
		message: string;
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
	interface LoadSpisHomeRequest extends PraetorServer.Service.WebServer.Messages.Request {
		id_Spis: System.Guid;
	}
	interface LoadSpisHomeResponse extends PraetorServer.Service.WebServer.Messages.Response {
		spis: PraetorServer.Service.WebServer.Messages.Dto.Spis;
	}
	interface LoadSpisDokumentyRequest extends PraetorServer.Service.WebServer.Messages.Request {
		id_Spis: System.Guid;
	}
	interface LoadSpisDokumentyResponse extends PraetorServer.Service.WebServer.Messages.Response {
		dokumenty: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode[];
	}
	interface LoadTimeSheetRequest extends PraetorServer.Service.WebServer.Messages.Request {
		id_Spis: System.Guid;
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
	interface LoadSpisCinnostiRequest extends PraetorServer.Service.WebServer.Messages.Request {
		id_Spis: System.Guid;
		cinnostiSince: Date;
		cinnostiUntil: Date;
	}
	interface LoadSpisCinnostiResponse extends PraetorServer.Service.WebServer.Messages.Response {
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
	interface Aktivita {
		id_Aktivita: System.Guid;
		nazev: string;
		popis: string;
		ord: number;
	}
	interface TimeSheet {
		id_Spis: System.Guid;
		spisOznaceni: string;
		id_Aktivita: System.Guid;
		datum: Date;
		cas: number;
		popis: string;
	}
}


