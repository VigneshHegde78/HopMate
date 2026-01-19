import { Query, type Models } from "appwrite";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { appwriteClient, databases } from "../lib/appwrite";

// Replace with your actual database and collection IDs
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID!;

const RealtimeDocumentList = () => {
	const [documents, setDocuments] = useState<Models.Document[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 1. Fetch initial documents
		const fetchDocuments = async () => {
			try {
				const response = await databases.listDocuments(
					DATABASE_ID,
					COLLECTION_ID,
					[Query.orderDesc("$createdAt")] // Optional: order by creation time
				);
				setDocuments(response.documents);
			} catch (error) {
				console.error("Failed to fetch documents", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDocuments();

		// 2. Subscribe to realtime changes
		// The channel to subscribe to all document changes in a specific collection
		const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;

		const unsubscribe = appwriteClient.subscribe(channel, (response) => {
			// Check the event type and update the state accordingly
			const payload = response.payload as Models.Document;
			if (
				response.events.includes("databases.*.collections.*.documents.*.create")
			) {
				setDocuments((prevDocs) => [payload, ...prevDocs]);
			} else if (
				response.events.includes("databases.*.collections.*.documents.*.update")
			) {
				setDocuments((prevDocs) =>
					prevDocs.map((doc) => (doc.$id === payload.$id ? payload : doc))
				);
			} else if (
				response.events.includes("databases.*.collections.*.documents.*.delete")
			) {
				setDocuments((prevDocs) =>
					prevDocs.filter((doc) => doc.$id !== payload.$id)
				);
			}
		});

		// 3. Return an unsubscribe function to clean up when the component unmounts
		return () => {
			unsubscribe();
		};
	}, []); // Empty dependency array means this runs once on mount

	if (loading) {
        console.log("Loading documents...");
        console.log(documents);
		return <Text>Loading documents...</Text>;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Realtime Documents</Text>
			<FlatList
				data={documents}
				keyExtractor={(item) => item.$id}
				renderItem={({ item }) => (
					<View style={styles.item}>
						<Text className="text-xl font-bold text-black">
							{item.$id || "Untitled Document"}
						</Text>
					</View>
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 20 },
	header: { fontSize: 18, fontWeight: "bold", margin: 10 },
	item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
});

export default RealtimeDocumentList;
