import { databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function DriverHome() {
	const DRIVER_ID = "695ca1b70007e0b62fbe"; // later from auth
	const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
	const COLLECTION_ID = "driver_location";

	const [isActive, setIsActive] = useState(false);
	const [coords, setCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	/* ---------------- LOCATION TRACKING ---------------- */
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
					const c = {
						latitude: loc.coords.latitude,
						longitude: loc.coords.longitude,
					};

					setCoords(c);

					if (isActive) {
						updateDriverLocation(c, true);
					}
				}
			);
		})();

		return () => sub?.remove();
	}, [isActive]);

	/* ---------------- UPDATE DB ---------------- */
	const updateDriverLocation = async (
		location: { latitude: number; longitude: number },
		active: boolean
	) => {
		try {
			await databases.updateDocument(DATABASE_ID, COLLECTION_ID, DRIVER_ID, {
				DriverLatitude: location.latitude,
				DriverLongitude: location.longitude,
				isActive: active,
				lastUpdatedAt: new Date().toISOString(),
			});
		} catch (err) {
			console.log("Driver update failed", err);
		}
	};

	/* ---------------- TOGGLE HANDLER ---------------- */
	const onToggle = async (value: boolean) => {
		setIsActive(value);

		if (coords) {
			await updateDriverLocation(coords, value);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Driver Status</Text>

			<View style={styles.row}>
				<Text style={styles.status}>{isActive ? "ONLINE" : "OFFLINE"}</Text>
				<Switch value={isActive} onValueChange={onToggle} />
			</View>

			{coords && (
				<Text style={styles.coords}>
					{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 24 },
	title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	status: { fontSize: 18 },
	coords: { marginTop: 20, color: "#555" },
});
