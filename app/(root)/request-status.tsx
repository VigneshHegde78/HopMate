// request-status.tsx
import CustomButton from "@/components/CustomButton";
import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "ride_requests";

type Props = {
	requestId: string;
	onAccepted: () => void;
	onCancelled: () => void;
	onCompleted?: () => void;
};

export default function RequestStatusView({
	requestId,
	onAccepted,
	onCancelled,
	onCompleted,
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
		} else if (status === "COMPLETED") {
			if (onCompleted) {
				onCompleted();
			}
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
					<Image
						source={require("@/assets/images/loader.gif")}
						style={{ width: 200, height: 200 }}
					/>
					<Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
						Waiting for driver...
					</Text>
					<CustomButton title="Cancel Request" bgVariant="danger" onPress={cancelRequest} />
				</>
			)}

			{status === "REJECTED" && (
				<Text style={{ color: "red", fontSize: 18, marginTop: 20 }}>Ride Rejected</Text>
			)}

			{status === "ACCEPTED" && (
				<View style={{ alignItems: "center", marginTop: 40 }}>
					<Text style={{ fontSize: 24, fontWeight: "bold", color: "#000" }}>
						Ride Confirmed 🎉
					</Text>
					<Text style={{ fontSize: 16, color: "gray", marginTop: 10 }}>
						Your driver is on the way!
					</Text>
				</View>
			)}
		</View>
	);
}
