import { account, databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { ID } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "ride_requests";

type Props = {
	driverId: string;
	destination: {
		name: string;
		latitude: number;
		longitude: number;
	};
	onRequestCreated: (id: string) => void;
};

export default function RequestRideView({
	driverId,
	destination,
	onRequestCreated,
}: Props) {
	const [seats, setSeats] = useState(1);
	const [source, setSource] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	useEffect(() => {
		(async () => {
			const loc = await Location.getCurrentPositionAsync({});
			setSource({
				latitude: loc.coords.latitude,
				longitude: loc.coords.longitude,
			});
		})();
	}, []);

	const submitRequest = async () => {
		if (!source) return;

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

		onRequestCreated(doc.$id);
	};

	return (
		<View>
			<Text>Destination: {destination.name}</Text>

			<View style={{ flexDirection: "row", marginVertical: 12 }}>
				<TouchableOpacity onPress={() => setSeats((s) => Math.max(1, s - 1))}>
					<Text style={{ fontSize: 20 }}>➖</Text>
				</TouchableOpacity>

				<Text style={{ marginHorizontal: 20 }}>{seats}</Text>

				<TouchableOpacity onPress={() => setSeats((s) => Math.min(4, s + 1))}>
					<Text style={{ fontSize: 20 }}>➕</Text>
				</TouchableOpacity>
			</View>

			<Button title="Send Request" onPress={submitRequest} />
		</View>
	);
}
