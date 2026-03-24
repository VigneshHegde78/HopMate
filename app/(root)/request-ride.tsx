import CustomButton from "@/components/CustomButton";
import { account, databases } from "@/lib/appwrite";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
	onBack: () => void;
	onRequestCreated: (id: string) => void;
};

export default function RequestRideView({
	driverId,
	destination,
	onRequestCreated,
	onBack,
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
			},
		);

		onRequestCreated(doc.$id);
	};

	return (
		<View>
			<TouchableOpacity onPress={onBack} className="flex-row items-center mb-3">
				<MaterialIcons name="arrow-back-ios" size={16} color="#0286FF" />
				<Text style={{ color: "#0286FF" }}>Back</Text>
			</TouchableOpacity>

			<View className="flex-row items-center gap-2 p-2 mb-3 bg-gray-100 rounded-lg">
				<FontAwesome6 name="location-arrow" size={18} color="#333" />
				<Text className="font-lexend text-md">{destination.name}</Text>
			</View>

			<View className="flex-row items-center gap-1 py-3 px-2 bg-gray-100 rounded-lg mb-5">
				<MaterialIcons name="person" size={18} color="#333" />
				<Text className="font-lexendSemiBold">Seats</Text>
				<View className="flex-row pl-5">
					<TouchableOpacity onPress={() => setSeats((s) => Math.max(1, s - 1))}>
						<MaterialIcons name="remove" size={20} color="#333" />
					</TouchableOpacity>

					<Text style={{ marginHorizontal: 20 }}>{seats}</Text>

					<TouchableOpacity onPress={() => setSeats((s) => Math.min(4, s + 1))}>
						<MaterialIcons name="add" size={20} color="#333" />
					</TouchableOpacity>
				</View>
			</View>

			<CustomButton
				title="Send Request"
				bgVariant="default"
				onPress={submitRequest}
			/>
		</View>
	);
}
