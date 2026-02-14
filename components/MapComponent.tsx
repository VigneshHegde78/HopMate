import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

/* ================= TYPES ================= */

type DriverDoc = {
	id: string;
	latitude: number;
	longitude: number;
	seatStatus: "AVAILABLE" | "FULL";
};

const fallbackRegion: Region = {
	latitude: 19.3036,
	longitude: 72.8602,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
};

/* ================= COMPONENT ================= */

export default function MapComponent({
	radiusKm = 2,
	onDriversChange,
	destination,
}: {
	radiusKm?: number;
	onDriversChange?: (
		drivers: {
			id: string;
			seatStatus: "AVAILABLE" | "FULL";
		}[]
	) => void;
	destination?: {
		latitude: number;
		longitude: number;
		name?: string;
	};
}) {
	const mapRef = useRef<MapView>(null);

	const [region, setRegion] = useState<Region>(fallbackRegion);
	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	const [drivers, setDrivers] = useState<DriverDoc[]>([]);

	/* ---------------- AUTO-ZOOM TO DESTINATION ---------------- */
	useEffect(() => {
		if (destination && mapRef.current) {
			mapRef.current.animateToRegion(
				{
					latitude: destination.latitude,
					longitude: destination.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				},
				600
			);
		}
	}, [destination]);

	/* ---------------- USER LOCATION ---------------- */
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

	/* ---------------- INITIAL FETCH ---------------- */
	useEffect(() => {
		const fetchDrivers = async () => {
			const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
			const COLLECTION_ID = "user_location";

			const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);

			const activeDrivers = res.documents
				.filter((d: any) => d.isActive === true)
				.map((d: any) => ({
					id: d.DriverId,
					latitude: Number(d.DriverLatitude),
					longitude: Number(d.DriverLongitude),
					seatStatus: d.seatStatus ?? "AVAILABLE",
				}));

			setDrivers(activeDrivers);
		};

		fetchDrivers();
	}, []);

	/* ---------------- REALTIME SUBSCRIBE ---------------- */
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
					if (!doc.isActive) {
						return prev.filter((d) => d.id !== doc.DriverId);
					}

					const updated: DriverDoc = {
						id: doc.DriverId,
						latitude: Number(doc.DriverLatitude),
						longitude: Number(doc.DriverLongitude),
						seatStatus: doc.seatStatus ?? "AVAILABLE",
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

	/* ---------------- EMIT TO RIDER UI ---------------- */
	useEffect(() => {
		const simplified = drivers.map((d) => ({
			id: d.id,
			seatStatus: d.seatStatus,
		}));

		onDriversChange?.(simplified);
	}, [drivers]);

	/* ---------------- UI ---------------- */
	return (
		<View style={styles.container}>
			<MapView
				ref={mapRef}
				style={styles.map}
				region={region}
				showsUserLocation
			>
				{drivers.map((d) => (
					<Marker
						key={d.id}
						coordinate={{
							latitude: d.latitude,
							longitude: d.longitude,
						}}
						title="Driver nearby"
						icon={require("../assets/icons/marker.png")}
					/>
				))}

				{destination && (
					<Marker
						coordinate={{
							latitude: destination.latitude,
							longitude: destination.longitude,
						}}
						title={destination.name || "Destination"}
						icon={require("../assets/icons/pin.png")}
					/>
				)}
			</MapView>
		</View>
	);
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { width: "100%", height: "100%" },
});
