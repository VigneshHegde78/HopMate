import AppwriteClientInstance, { account, databases } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "ride_requests";

type CompletedRide = {
	id: string;
	destinationName: string;
	seatsRequested: number;
	completedAt: string;
};

export default function Rides() {
	const [riderId, setRiderId] = useState<string | null>(null);
	const [rides, setRides] = useState<CompletedRide[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadRider = async () => {
			try {
				const user = await account.get();
				setRiderId(user.$id);
			} catch (err) {
				console.error("Failed to load rider account:", err);
			} finally {
				setLoading(false);
			}
		};

		loadRider();
	}, []);

	useEffect(() => {
		if (!riderId) return;

		const fetchCompletedRides = async () => {
			try {
				const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
					Query.equal("RiderId", riderId),
					Query.equal("Status", "COMPLETED"),
					Query.orderDesc("$updatedAt"),
				]);

				setRides(
					res.documents.map((doc: any) => ({
						id: doc.$id,
						destinationName: doc.DestinationName || "Unknown destination",
						seatsRequested: doc.SeatsRequested || 0,
						completedAt: doc.$updatedAt,
					})),
				);
			} catch (err) {
				console.error("Failed to fetch rider history:", err);
			}
		};

		fetchCompletedRides();

		const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
				const doc = event.payload;
				if (!doc || doc.RiderId !== riderId) return;

				if (doc.Status === "COMPLETED") {
					setRides((prev) => {
						const ride: CompletedRide = {
							id: doc.$id,
							destinationName: doc.DestinationName || "Unknown destination",
							seatsRequested: doc.SeatsRequested || 0,
							completedAt: doc.$updatedAt,
						};

						const withoutCurrent = prev.filter((r) => r.id !== doc.$id);
						return [ride, ...withoutCurrent];
					});
					return;
				}

				setRides((prev) => prev.filter((r) => r.id !== doc.$id));
			},
		);

		return () => unsubscribe();
	}, [riderId]);

	if (loading) {
		return (
			<SafeAreaView className="bg-gray-100 p-3">
				<View className="items-center justify-center mt-10">
					<Text className="text-gray-500">Loading your ride history...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="bg-gray-100 p-3">
			<Text className="text-3xl font-lexendBold text-[#454545]">
				Ride History
			</Text>
			<Text className="text-md font-lexendRegular text-gray-500">
				You can see your recent rides here.
			</Text>
			<FlatList
				data={rides}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View className="bg-white rounded-xl p-4 mb-3 shadow-sm shadow-neutral-200">
						<Text className="font-lexendSemiBold text-gray-800 mb-1">
							Destination: {item.destinationName}
						</Text>
						<Text className="font-lexendRegular text-gray-600 mb-1">
							Seats: {item.seatsRequested}
						</Text>
						<Text className="font-lexendRegular text-xs text-gray-500">
							Completed: {new Date(item.completedAt).toLocaleString()}
						</Text>
					</View>
				)}
				className="my-3"
				ListEmptyComponent={
					<View className="items-center justify-center mt-10">
						<Text className="text-gray-500">No completed rides yet.</Text>
					</View>
				}
			/>
		</SafeAreaView>
	);
}
