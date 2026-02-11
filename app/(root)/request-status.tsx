import AppwriteClientInstance from "@/lib/appwrite";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;

export default function RequestStatus() {
	const { requestId } = useLocalSearchParams<{ requestId: string }>();
	const router = useRouter();

	const [status, setStatus] = useState("PENDING");

	useEffect(() => {
		if (!requestId) return;

		const channel = `databases.${DATABASE_ID}.collections.ride_requests.documents.${requestId}`;

		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
				const doc = event.payload;
				if (!doc) return;

				setStatus(doc.Status);
			}
		);

		return () => unsubscribe();
	}, [requestId]);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				padding: 24,
			}}
		>
			{status === "PENDING" && (
				<>
					<Text style={{ fontSize: 22, fontWeight: "bold" }}>
						Request Sent 🚀
					</Text>
					<Text style={{ marginTop: 10, color: "#666" }}>
						Waiting for driver...
					</Text>
				</>
			)}

			{status === "ACCEPTED" && (
				<>
					<Text style={{ fontSize: 22, fontWeight: "bold", color: "green" }}>
						Ride Accepted 🎉
					</Text>
					<Text style={{ marginTop: 10 }}>Your driver is on the way.</Text>
				</>
			)}

			{status === "REJECTED" && (
				<>
					<Text style={{ fontSize: 22, fontWeight: "bold", color: "red" }}>
						Ride Rejected ❌
					</Text>
					<Text style={{ marginTop: 10 }}>Please try another driver.</Text>
				</>
			)}
		</View>
	);
}
