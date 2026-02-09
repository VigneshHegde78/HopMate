import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

const fallbackRegion: Region = {
	latitude: 19.3036,
	longitude: 72.8602,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
};

type DriverMarker = {
	id: string;
	latitude: number;
	longitude: number;
};

export default function MapComponent({ radiusKm = 2 }: { radiusKm?: number }) {
	const mapRef = useRef<MapView>(null);

	const [region, setRegion] = useState<Region>(fallbackRegion);
	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [drivers, setDrivers] = useState<DriverMarker[]>([]);

	// ---------------- USER LOCATION ----------------
	useEffect(() => {
		let sub: Location.LocationSubscription;

		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return;

			sub = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Balanced,
					timeInterval: 5000,
					distanceInterval: 25,
				},
				(loc) => {
					const coords = {
						latitude: loc.coords.latitude,
						longitude: loc.coords.longitude,
					};
					setUserLocation(coords);
					setRegion((r) => ({ ...r, ...coords }));
				}
			);
		})();

		return () => sub?.remove();
	}, []);

	// ---------------- REALTIME DRIVER SUBSCRIPTION ----------------
	useEffect(() => {
		const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
		const COLLECTION_ID = "user_location";

		const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;

		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
				const doc = event.payload;
				if (!doc) return;

				setDrivers((prev) => {
					// 🔴 Driver OFF → remove
					if (!doc.isActive) {
						return prev.filter((d) => d.id !== doc.DriverId);
					}

					// 🟢 Driver ON → add/update
					const updated = {
						id: doc.DriverId,
						latitude: parseFloat(doc.DriverLatitude),
						longitude: parseFloat(doc.DriverLongitude),
					};

					const exists = prev.find((d) => d.id === doc.DriverId);
					if (exists) {
						return prev.map((d) => (d.id === doc.DriverId ? updated : d));
					}

					return [...prev, updated];
				});
			}
		);

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const fetchActiveDrivers = async () => {
			const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
			const COLLECTION_ID = "user_location";

			try {
				const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);

				const activeDrivers = res.documents
					.filter((d: any) => d.isActive === true)
					.map((d: any) => ({
						id: d.DriverId,
						latitude: parseFloat(d.DriverLatitude),
						longitude: parseFloat(d.DriverLongitude),
					}));

				setDrivers(activeDrivers);
				console.log("Fetched active drivers:", activeDrivers);
			} catch (err) {
				console.log("Initial driver fetch failed: ", err);
			}
		};

		fetchActiveDrivers();
	}, []);

	// ---------------- DISTANCE FILTER ----------------
	const visibleDrivers = drivers;

	// ---------------- UI ----------------
	return (
		<View style={styles.container}>
			<MapView
				style={styles.map}
				initialRegion={fallbackRegion}
				showsUserLocation
			>
				{visibleDrivers.map((d) => (
					<Marker
						key={d.id}
						coordinate={{
							latitude: d.latitude,
							longitude: d.longitude,
						}}
						title="Active Driver"
						icon={require("../assets/icons/marker.png")}
					/>
				))}
			</MapView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { width: "100%", height: "100%" },
});
