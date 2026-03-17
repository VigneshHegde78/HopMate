import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import { type DriverDoc } from "@/types";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";

/* ================= TYPES ================= */

const fallbackRegion: Region = {
	latitude: 18.97378,
	longitude: 72.81069,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
};

function hasValidCoordinates(lat: number, lng: number) {
	return Number.isFinite(lat) && Number.isFinite(lng);
}

/* ================= DISTANCE UTILITY ================= */

function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) {
	const R = 6371; // Earth radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) ** 2;

	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ================= COMPONENT ================= */

export default function MapComponent({
	radiusKm = 2,
	onDriversChange,
	destination,
}: {
	radiusKm?: number;
	onDriversChange?: (drivers: DriverDoc[]) => void;
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

	const upsertDriver = (list: DriverDoc[], incoming: DriverDoc) => {
		const index = list.findIndex((d) => d.id === incoming.id);
		if (index === -1) return [...list, incoming];

		const next = [...list];
		next[index] = incoming;
		return next;
	};

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
				600,
			);
		}
	}, [destination]);

	/* ---------------- USER LOCATION WATCH ---------------- */
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
				},
			);
		})();

		return () => sub?.remove();
	}, []);

	/* ---------------- INITIAL FETCH ---------------- */
	useEffect(() => {
		const fetchDrivers = async () => {
			try {
				const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
				const COLLECTION_ID = "user_location";

				const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);

				const dedupedByDriver = new Map<string, DriverDoc>();

				res.documents
					.filter((d: any) => d.isActive === true && d.DriverId)
					.forEach((d: any) => {
						const latitude = Number(d.DriverLatitude);
						const longitude = Number(d.DriverLongitude);
						if (!hasValidCoordinates(latitude, longitude)) return;

						dedupedByDriver.set(d.DriverId, {
							id: d.DriverId,
							name: d.DriverName ?? "Unknown Driver",
							vehicleType: d.VehicleType,
							vehicleModel: d.VehicleModel,
							plateNumber: d.PlateNumber,
							latitude,
							longitude,
							seatStatus: d.seatStatus ?? "AVAILABLE",
						});
					});

				const activeDrivers = Array.from(dedupedByDriver.values());

				setDrivers(activeDrivers);
			} catch (err) {
				console.error("Failed to fetch active drivers:", err);
			}
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
				if (!doc?.DriverId) return;

				setDrivers((prev) => {
					if (!doc.isActive) {
						return prev.filter((d) => d.id !== doc.DriverId);
					}

					const latitude = Number(doc.DriverLatitude);
					const longitude = Number(doc.DriverLongitude);
					if (!hasValidCoordinates(latitude, longitude)) return prev;

					const updated: DriverDoc = {
						id: doc.DriverId,
						name: doc.DriverName ?? "Unknown Driver",
						vehicleType: doc.VehicleType,
						vehicleModel: doc.VehicleModel,
						plateNumber: doc.PlateNumber,
						latitude,
						longitude,
						seatStatus: doc.seatStatus ?? "AVAILABLE",
					};

					return upsertDriver(prev, updated);
				});
			},
		);

		return () => unsubscribe();
	}, []);

	/* ---------------- FILTER BY RADIUS + EMIT ---------------- */
	useEffect(() => {
		if (!onDriversChange) return;

		if (!userLocation) {
			onDriversChange(drivers);
			return;
		}

		const filtered = drivers.filter((d) => {
			const dist = calculateDistance(
				userLocation.latitude,
				userLocation.longitude,
				d.latitude,
				d.longitude,
			);
			return dist <= radiusKm;
		});

		onDriversChange(filtered);
	}, [drivers, userLocation, radiusKm, onDriversChange]);

	/* ---------------- UI ---------------- */
	return (
		<View style={styles.container}>
			<MapView
				ref={mapRef}
				style={styles.map}
				region={region}
				showsUserLocation
				rotateEnabled={false}
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

				{userLocation && (
					<Circle
						center={userLocation}
						radius={radiusKm * 1000}
						strokeColor="rgba(0,122,255,0.5)"
						fillColor="rgba(0,122,255,0.2)"
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
