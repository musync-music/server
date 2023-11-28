export interface SyncData {
	id: string;
	partyId: string;
	serviceId: "yt-music" | "spotify";
	device: {
		id: string;
		name: string;
	};
	media: {
		id: string;
		title: string;
		artist: string;
		album?: string;
		duration?: number;
		url: string;
	};
}
