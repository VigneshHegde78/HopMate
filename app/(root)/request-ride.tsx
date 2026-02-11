import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import { account, databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
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

			<Text style={{ marginVertical: 16 }}>Seats needed: {seats}</Text>

			<Button
				title="Increase"
				onPress={() => setSeats((s) => Math.min(s + 1, 4))}
			/>
			<Button
				title="Decrease"
				onPress={() => setSeats((s) => Math.max(s - 1, 1))}
			/>

			<View style={{ marginTop: 20 }}>
				<Button title="Send Request" onPress={submitRequest} />
			</View>
		</View>
	);
}
