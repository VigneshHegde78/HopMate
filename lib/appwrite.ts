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
		console.log("signInWithGoogle called");
		const redirectUrl = Linking.createURL("oauth/callback");
		const url = account.createOAuth2Session(
			OAuthProvider.Google,
			redirectUrl,
			redirectUrl,
		) as URL | void;

		if (!url) {
			throw new Error("Failed to create OAuth2 session URL");
		}

		console.log("Opening OAuth session URL:", url.toString());
		await WebBrowser.openBrowserAsync(url.toString());
		console.log("Auth session finished");
	} catch (error) {
		console.error("Google Sign-In Error:", error);
		throw new Error("Failed to sign in with Google");
	}
};
