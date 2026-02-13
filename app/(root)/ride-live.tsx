import AppwriteClientInstance from "@/lib/appwrite";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;

export default function RideLive() {
	const { requestId } = useLocalSearchParams();

	const [driverLocation, setDriverLocation] = useState<any>(null);
	const [riderLocation, setRiderLocation] = useState<any>(null);

	useEffect(() => {
		if (!requestId) return;

		const channel = `databases.${DATABASE_ID}.collections.user_location.documents`;

		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
				const doc = event.payload;
				if (!doc) return;

				if (doc.DriverId) {
					setDriverLocation({
						latitude: doc.DriverLatitude,
						longitude: doc.DriverLongitude,
					});
				}

				if (doc.RiderId) {
					setRiderLocation({
						latitude: doc.RiderLatitude,
						longitude: doc.RiderLongitude,
					});
				}
			}
		);

		return () => unsubscribe();
	}, [requestId]);

	return (
		<View style={{ flex: 1 }}>
			<MapView
				style={{ flex: 1 }}
				initialRegion={{
					latitude: 19.3036,
					longitude: 72.8602,
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				}}
			>
				{driverLocation && (
					<Marker coordinate={driverLocation} title="Driver" pinColor="blue" />
				)}

				{riderLocation && (
					<Marker coordinate={riderLocation} title="You" pinColor="green" />
				)}

				{driverLocation && riderLocation && (
					<Polyline
						coordinates={[driverLocation, riderLocation]}
						strokeColor="black"
						strokeWidth={4}
					/>
				)}
			</MapView>
		</View>
	);
}
