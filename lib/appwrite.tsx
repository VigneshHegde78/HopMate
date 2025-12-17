    import { Account, Client, Databases, Storage, TablesDB } from 'react-native-appwrite';

    export const appwriteClient = new Client()
        .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite Endpoint
        .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

    export const account = new Account(appwriteClient);
    export const databases = new Databases(appwriteClient);
    export const storage = new Storage(appwriteClient);

    export const tableDB = new TablesDB(appwriteClient);
    export default appwriteClient;
    export { Account, Client, Databases, Storage };

