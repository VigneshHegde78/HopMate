import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import { account, databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

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

		const user = await account.get();

		await databases.createDocument(DATABASE_ID, COLLECTION_ID, "unique()", {
			riderId: user.$id,
			driverId,
			sourceLat: source.latitude,
			sourceLng: source.longitude,
			destinationName: destination.name,
			destinationLat: destination.latitude,
			destinationLng: destination.longitude,
			seatsRequested: seats,
			status: "PENDING",
			createdAt: new Date().toISOString(),
		});

		router.back(); // go back to home
	};

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
				Request Ride
			</Text>

			<DestSearchBar onPlaceSelected={setDestination} />

			<Text style={{ marginVertical: 16 }}>Seats needed: {seats}</Text>

			<Button title="+" onPress={() => setSeats((s) => Math.min(s + 1, 4))} />
			<Button title="-" onPress={() => setSeats((s) => Math.max(s - 1, 1))} />

			<View style={{ marginTop: 20 }}>
				<Button
					title="Send Request"
					onPress={() =>
						router.replace({
							pathname: "/request-status",
							params: { driverId },
						})
					}
				/>
			</View>
		</View>
	);
}
