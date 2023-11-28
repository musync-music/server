import firebase, { type ServiceAccount, credential } from "firebase-admin";

const credentials: ServiceAccount = {
	projectId: process.env.FIREBASE_PROJECT_ID,
	privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n"),
	clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let firestore: firebase.firestore.Firestore;

if (!firebase.apps.length) {
	firebase.initializeApp({
		credential: credential.cert(credentials),
		databaseURL: `https://${credentials.projectId}-default-rtdb.firebaseio.com`,
	});
	firestore = firebase.firestore();
	firestore.settings({ ignoreUndefinedProperties: true });
}

firestore = firebase.firestore();
const realtime = firebase.database();
export { firestore, realtime };
