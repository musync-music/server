export type Services = "yt-music" | "spotify";

export interface MediaData {
	id: string;
	service: Services;
	title: string;
	artist: string;
	album?: string;
	duration?: number;
	url: string;
}

export interface SyncData {
	id: string;
	partyId: string;
	device: {
		id: string;
		name: string;
	};
	media: MediaData[];
}

export interface SingleSyncData {
	id: string;
	partyId: string;
	serviceId: Services;
	device: {
		id: string;
		name: string;
	};
	media: MediaData;
}
