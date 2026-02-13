import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import { account, databases } from "@/lib/appwrite";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { ID } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "ride_requests";

export default function RequestRide() {
	const { driverId } = useLocalSearchParams<{ driverId: string }>();

	const [destination, setDestination] = useState<Destination | null>(null);
	const [seats, setSeats] = useState(1);
	const [source, setSource] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	/* --------- GET CURRENT LOCATION --------- */
	useEffect(() => {
		(async () => {
			const loc = await Location.getCurrentPositionAsync({});
			setSource({
				latitude: loc.coords.latitude,
				longitude: loc.coords.longitude,
			});
		})();
	}, []);

	/* --------- SUBMIT REQUEST --------- */
	const submitRequest = async () => {
		if (!driverId || !destination || !source) return;

		try {
			const user = await account.get();

			const doc = await databases.createDocument(
				DATABASE_ID,
				COLLECTION_ID,
				ID.unique(),
				{
					RiderId: user.$id,
					DriverId: driverId,
					RiderLat: source.latitude,
					RiderLng: source.longitude,
					DestinationName: destination.name,
					DestinationLat: destination.latitude,
					DestinationLng: destination.longitude,
					SeatsRequested: seats,
					Status: "PENDING",
				}
			);

			router.replace({
				pathname: "/request-status",
				params: { requestId: doc.$id },
			});
		} catch (err) {
			console.log("Request failed:", err);
		}
	};

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
				Request Ride
			</Text>

			<DestSearchBar onPlaceSelected={setDestination} />

			<View className="flex-row items-center my-4 rounded-lg px-3 pb-3 gap-3">
				<FontAwesome6 name="location-arrow" size={24} />
				<Text className="font-figtreeSemiBold text-lg">
					{destination ? destination.name : "Search destination..."}
				</Text>
			</View>

			<View className="flex-row items-center rounded-lg px-3 gap-3">
				<Ionicons name="people-sharp" size={24} />
				<Text className="font-figtreeSemiBold text-lg">Seats: {seats}</Text>
			</View>

			<View className="flex-row h-10 items-center ">
				<TouchableOpacity
					onPress={() => setSeats((s) => Math.min(s + 1, 4))}
					style={{
						height: 40,
						width: 40,
						backgroundColor: "blue",
						padding: 10,
						borderRadius: 5,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Text style={{ color: "#fff" }}>+</Text>
				</TouchableOpacity>
				<View>
					<Text style={{ marginHorizontal: 16 }}>{seats}</Text>
				</View>
				<TouchableOpacity
					onPress={() => setSeats((s) => Math.max(s - 1, 1))}
					style={{
						width: 40,
						height: 40,
						backgroundColor: "blue",
						padding: 10,
						borderRadius: 5,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Text style={{ color: "#fff" }}>-</Text>
				</TouchableOpacity>
			</View>

			<Text style={{ marginVertical: 16 }}>Seats needed: {seats}</Text>

			<View style={{ marginTop: 20 }}>
				<Button title="Send Request" onPress={submitRequest} />
			</View>
		</View>
	);
}
