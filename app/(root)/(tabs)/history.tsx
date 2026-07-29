import AppwriteClientInstance, { account, databases } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "ride_requests";

type CompletedRide = {
	id: string;
	originAddress: string;
	destinationName: string;
	originLat: number | null;
	originLng: number | null;
	destinationLat: number | null;
	destinationLng: number | null;
	seatsRequested: number;
	paymentStatus: string;
	rating: number;
	completedAt: string;
};

type RideRequestDocument = {
	$id: string;
	$updatedAt: string;
	OriginName?: string;
	DestinationName?: string;
	OriginLat?: number | string | null;
	OriginLng?: number | string | null;
	DestinationLat?: number | string | null;
	DestinationLng?: number | string | null;
	SeatsRequested?: number | string | null;
	PaymentStatus?: string;
	Rating?: number | string | null;
	DriverId?: string;
	Status?: string;
};

const formatCompletedDate = (iso: string) => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "Not available";
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});
};

const formatCompletedTime = (iso: string) => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "Not available";
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getMapUrl = (lng: number | null, lat: number | null) => {
	if (lat == null || lng == null) return null;
	return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${lng},${lat}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`;
};

const parseNullableNumber = (value: number | string | null | undefined) => {
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value !== "string" || value.trim() === "") return null;

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

const mapCompletedRide = (doc: RideRequestDocument): CompletedRide => ({
	id: doc.$id,
	originAddress: doc.OriginName || "Unknown origin",
	destinationName: doc.DestinationName || "Unknown destination",
	originLat: parseNullableNumber(doc.OriginLat),
	originLng: parseNullableNumber(doc.OriginLng),
	destinationLat: parseNullableNumber(doc.DestinationLat),
	destinationLng: parseNullableNumber(doc.DestinationLng),
	seatsRequested: parseNullableNumber(doc.SeatsRequested) ?? 0,
	paymentStatus: doc.PaymentStatus || "pending",
	rating: parseNullableNumber(doc.Rating) ?? 0,
	completedAt: doc.$updatedAt,
});

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

				setRides(res.documents.map((doc) => mapCompletedRide(doc)));
			} catch (err) {
				console.error("Failed to fetch history:", err);
			}
		};

		fetchCompletedRides();

		const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
				const doc = event.payload as RideRequestDocument;
				if (!doc || doc.DriverId !== driverId) return;

				if (doc.Status === "COMPLETED") {
					setRides((prev) => {
						const ride = mapCompletedRide(doc);
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
			<SafeAreaView className="flex-1 bg-gray-100 p-3">
				<View className="items-center justify-center mt-10">
					<Text className="text-gray-500">Loading history...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!driverId) {
		return (
			<SafeAreaView className="flex-1 bg-gray-100 p-3">
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-gray-600 font-lexendRegular">
						Unable to load your driver profile right now.
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-100 p-3">
			<View className="flex-1">
				<Text className="text-3xl font-lexendBold text-[#454545]">
					Ride History
				</Text>
				<Text className="text-md font-lexendRegular text-gray-500 mb-2">
					Completed rides are shown here.
				</Text>

				<FlatList
					data={rides}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => {
						const destinationMapUrl = getMapUrl(
							item.destinationLng,
							item.destinationLat,
						);

						return (
							<View className="flex items-center justify-center rounded-xl bg-white mb-3 shadow-sm shadow-neutral-300">
								<View className="flex flex-col items-start justify-center p-3 w-full">
									<View className="flex flex-row items-center justify-between w-full">
										{destinationMapUrl ? (
											<Image
												source={{
													uri: destinationMapUrl,
												}}
												style={{ width: 94, height: 84, borderRadius: 10 }}
											/>
										) : (
											<View className="w-[94px] h-[84px] rounded-lg bg-gray-200 items-center justify-center">
												<Text className="text-[11px] text-gray-500 font-lexendRegular text-center px-2">
													Map unavailable
												</Text>
											</View>
										)}

										<View className="flex-1 ml-4">
											<Text className="text-sm font-lexendRegular text-gray-500 mb-1">
												Destination
											</Text>
											<Text
												className="text-base font-lexendSemiBold text-gray-800"
												numberOfLines={2}
											>
												{item.destinationName}
											</Text>
										</View>
									</View>

									<View className="flex flex-col w-full mt-4 rounded-lg bg-gray-100 p-3">
										<View className="flex-row items-center justify-between mb-3">
											<Text className="text-sm font-lexendRegular text-gray-500">
												Seats
											</Text>
											<Text className="text-sm font-lexendSemiBold text-gray-800">
												{item.seatsRequested}
											</Text>
										</View>

										<View className="flex-row items-center justify-between mb-3">
											<Text className="text-sm font-lexendRegular text-gray-500">
												Completed Date
											</Text>
											<Text className="text-sm font-lexendSemiBold text-gray-800">
												{formatCompletedDate(item.completedAt)}
											</Text>
										</View>

										<View className="flex-row items-center justify-between">
											<Text className="text-sm font-lexendRegular text-gray-500">
												Completed Time
											</Text>
											<Text className="text-sm font-lexendSemiBold text-gray-800">
												{formatCompletedTime(item.completedAt)}
											</Text>
										</View>
									</View>
								</View>
							</View>
						);
					}}
					className="my-3"
					ListEmptyComponent={
						<View className="items-center justify-center mt-10">
							<Text className="text-gray-500">No completed rides yet.</Text>
						</View>
					}
				/>
			</View>
		</SafeAreaView>
	);
};

export default History;
