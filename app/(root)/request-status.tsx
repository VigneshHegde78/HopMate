// request-status.tsx
import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "ride_requests";

type Props = {
	requestId: string;
	onAccepted: () => void;
	onCancelled: () => void;
};

export default function RequestStatusView({
	requestId,
	onAccepted,
	onCancelled,
}: Props) {
	const [status, setStatus] = useState("PENDING");

	useEffect(() => {
		const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents.${requestId}`;

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

	useEffect(() => {
		if (status === "ACCEPTED") {
			onAccepted();
		}
	}, [status]);

	const cancelRequest = async () => {
		await databases.updateDocument(DATABASE_ID, COLLECTION_ID, requestId, {
			Status: "CANCELLED",
		});

		onCancelled();
	};

	return (
		<View style={{ alignItems: "center" }}>
			{status === "PENDING" && (
				<>
					<Text style={{ fontSize: 22, fontWeight: "bold" }}>
						Waiting for driver...
					</Text>
					<Button title="Cancel Request" onPress={cancelRequest} />
				</>
			)}

			{status === "REJECTED" && (
				<Text style={{ color: "red" }}>Ride Rejected</Text>
			)}
		</View>
	);
}
