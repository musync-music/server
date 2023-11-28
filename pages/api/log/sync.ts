import { SyncData } from "@/entities/SyncData";
import { realtime } from "@/models/database";
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { v4 as uuid } from "uuid";
import cors from "cors";

const router = createRouter<NextApiRequest, NextApiResponse>();

interface PostHandlerBody {
	party: string;
	serviceId: "yt-music" | "spotify";
	deviceId: string;
	deviceName: string;
	media: {
		id: string;
		title: string;
		artist: string;
		album?: string;
		duration?: number;
		url: string;
	};
}

router
	.use(
		cors({
			origin: "*",
		})
	)
	.get(async (req, res) => {
		const party = req.query.party;

		if (!party || typeof party !== "string") {
			return res.status(400).json({
				message: "Código de sala ausente.",
				action: "Informe o código de sala.",
				error_code: "API:LOG:SYNC:GET:PARTY_ID_MISSING",
			});
		}

		try {
			const ref = realtime.ref("players");
			const snapshot = await ref.orderByChild("partyId").equalTo(party).get();

			const data = (snapshot.toJSON() || {}) as { [x: string]: SyncData };
			const docs: SyncData[] = [];
			Object.keys(data).forEach(key => docs.push(data[key]));

			const ytData: SyncData[] = [];
			const spotifyData: SyncData[] = [];

			for (const doc of docs) {
				if (doc.serviceId === "yt-music") ytData.push(doc);
				else if (doc.serviceId === "spotify") spotifyData.push(doc);
			}

			return res.status(200).json({
				message: "Dados recuperados com sucesso.",
				data: {
					partyId: party,
					yt_devices: ytData,
					spotify_devices: spotifyData,
				},
			});
		} catch (err) {
			console.error(err);

			return res.status(500).json({
				message: "Não foi possível sincronizar.",
				action: "Tente novamente.",
				error_code: "API:LOG:SYNC:GET:FETCH_FAILED",
				trace: err,
			});
		}
	});

router
	.use(
		cors({
			origin: "*",
		})
	)
	.post(async (req, res) => {
		const body =
			typeof req.body === "object"
				? (req.body as PostHandlerBody)
				: (JSON.parse(req.body) as PostHandlerBody);

		const syncData: SyncData = {
			id: uuid(),
			partyId: body.party,
			serviceId: body.serviceId,
			device: {
				id: body.deviceId,
				name: body.deviceName,
			},
			media: body.media,
		};

		try {
			const ref = realtime.ref("players");
			const snapshot = await ref.orderByChild("device/id").get();

			if (snapshot.exists() && snapshot.toJSON()) {
				const docs = snapshot.toJSON() as { [x: string]: SyncData };
				const data = docs[Object.keys(docs)[0]];

				// @ts-ignore
				delete syncData.id;
				await ref.child(data.id).set({
					...data,
					...syncData,
				});
			} else {
				await ref.child(syncData.id).set(syncData);
			}

			return res.status(200).json({
				message: "Dados sincronizados.",
				data: syncData,
			});
		} catch (err) {
			console.error(err);

			return res.status(500).json({
				message: "Não foi possível sincronizar.",
				action: "Tente novamente.",
				error_code: "API:LOG:SYNC:POST:CREATE_FAILED",
				trace: err,
			});
		}
	});

export default router.handler({
	onError: (err, req, res) => {
		console.error(err);
		return res.status(500).json({
			message: "Houve um erro inesperado.",
			action: "Tente novamente ou reporte o erro.",
			error_code: "API:LOG:SYNC:UNHANDLED_ERROR",
		});
	},
});
