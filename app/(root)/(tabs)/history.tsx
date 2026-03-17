import AppwriteClientInstance, { account, databases } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "ride_requests";

type CompletedRide = {
	id: string;
	destinationName: string;
	seatsRequested: number;
	completedAt: string;
};

const History = () => {
	const [driverId, setDriverId] = useState<string | null>(null);
	const [rides, setRides] = useState<CompletedRide[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDriver = async () => {
			try {
				const user = await account.get();
				setDriverId(user.$id);
			} catch (err) {
				console.error("Failed to load account:", err);
			} finally {
				setLoading(false);
			}
		};

		loadDriver();
	}, []);

	useEffect(() => {
		if (!driverId) return;

		const fetchCompletedRides = async () => {
			try {
				const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
					Query.equal("DriverId", driverId),
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
				console.error("Failed to fetch history:", err);
			}
		};

		fetchCompletedRides();

		const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
				const doc = event.payload;
				if (!doc || doc.DriverId !== driverId) return;

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
	}, [driverId]);

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-white">
				<View className="flex-1 justify-center items-center p-5">
					<Text className="text-base font-lexendRegular text-gray-600">
						Loading history...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-1 p-5">
				<Text className="text-2xl font-figtreeBold text-gray-800 mb-1">
					Ride History
				</Text>
				<Text className="text-sm font-lexendRegular text-gray-500 mb-4">
					Completed rides are shown here.
				</Text>

				<FlatList
					data={rides}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<View className="bg-gray-100 rounded-xl p-4 mb-3">
							<Text className="font-lexendSemiBold text-gray-800 mb-1">
								Destination: {item.destinationName}
							</Text>
							<Text className="font-lexendRegular text-gray-600 mb-1">
								Seats: {item.seatsRequested}
							</Text>
							<Text className="font-lexendRegular text-gray-500 text-xs">
								Completed: {new Date(item.completedAt).toLocaleString()}
							</Text>
						</View>
					)}
					ListEmptyComponent={
						<View className="mt-12 items-center">
							<Text className="text-base font-lexendRegular text-gray-600 text-center">
								No completed rides yet.
							</Text>
						</View>
					}
				/>
			</View>
		</SafeAreaView>
	);
};

export default History;
