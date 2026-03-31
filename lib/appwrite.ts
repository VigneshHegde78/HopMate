import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
	Account,
	Client,
	Databases,
	OAuthProvider,
	Storage,
	TablesDB,
} from "react-native-appwrite";

export const appwriteClient = new Client()
	.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);
export const storage = new Storage(appwriteClient);

export const tableDB = new TablesDB(appwriteClient);
export default appwriteClient;
export { Account, Client, Databases, Storage };

export const signInWithGoogle = async () => {
	try {
		const redirectUrl = `appwrite-callback-${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}://oauth/callback`;

		const url = account.createOAuth2Token(
			OAuthProvider.Google,
			redirectUrl,
			redirectUrl,
		);
		if (!url) throw new Error("Failed to create OAuth2 Token");

		const result = await WebBrowser.openAuthSessionAsync(
			url.toString(),
			redirectUrl,
		);

		if (result.type !== "success") {
			throw new Error("OAuth cancelled");
		}

		const parsedUrl = Linking.parse(result.url);
		const secret = parsedUrl.queryParams?.secret?.toString();
		const userId = parsedUrl.queryParams?.userId?.toString();

		if (!secret || !userId) {
			throw new Error("Missing auth params from OAuth callback");
		}

		await account.createSession(userId, secret);

		// 👇 THIS is what your UI needs
		const user = await account.get();
		return user;
	} catch (error) {
		console.error("Google Sign-In Error:", error);
		throw error;
	}
};
