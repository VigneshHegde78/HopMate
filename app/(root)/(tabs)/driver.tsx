import { account, databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

/* ================= CONFIG ================= */

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "user_location";

type RideRequest = {
	id: string;
	destinationName: string;
	seatsRequested: number;
};

/* ================= COMPONENT ================= */

export default function DriverHome() {
	const [driverId, setDriverId] = useState<string | null>(null);
	const [isActive, setIsActive] = useState(false);
	const [requests, setRequests] = useState<RideRequest[]>([]);
	const [seatStatus, setSeatStatus] = useState<"AVAILABLE" | "FULL">(
		"AVAILABLE"
	);
	const [coords, setCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	/* ---------------- AUTH ---------------- */
	useEffect(() => {
		const loadUser = async () => {
			try {
				const user = await account.get();
				setDriverId(user.$id);
				console.log("Driver logged in:", user.$id);
			} catch {
				console.log("No user logged in.");
			}
		};

		loadUser();
	}, []);

	/* ---------------- SEAT STATUS ---------------- */
	const onSeatToggle = async (value: boolean) => {
		const status = value ? "AVAILABLE" : "FULL";
		setSeatStatus(status);

		if (!coords || !driverId) return;

		await databases.updateDocument(DATABASE_ID, COLLECTION_ID, driverId, {
			seatStatus: status,
			lastUpdatedAt: new Date().toISOString(),
		});
	};

	/* ---------------- LOCATION WATCHER ---------------- */
	useEffect(() => {
		if (!driverId || !isActive) return;

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
				async (loc) => {
					const c = {
						latitude: loc.coords.latitude,
						longitude: loc.coords.longitude,
					};

					setCoords(c);

					if (isActive) {
						await upsertDriverLocation(c, true);
					}
				}
			);
		})();

		return () => sub?.remove();
	}, [driverId, isActive]);

	/* ---------------- UPSERT (CREATE OR UPDATE) ---------------- */
	const upsertDriverLocation = async (
		location: { latitude: number; longitude: number },
		active: boolean
	) => {
		if (!driverId) return;

		try {
			// Try update first
			await databases.updateDocument(DATABASE_ID, COLLECTION_ID, driverId, {
				DriverLatitude: location.latitude,
				DriverLongitude: location.longitude,
				isActive: active,
				$updatedAt: new Date().toISOString(),
			});
		} catch (err: any) {
			// If document does not exist → create it
			if (err.code === 404) {
				await databases.createDocument(
					DATABASE_ID,
					COLLECTION_ID,
					driverId, // documentId = userId
					{
						DriverId: driverId,
						DriverLatitude: location.latitude,
						DriverLongitude: location.longitude,
						isActive: active,
						$updatedAt: new Date().toISOString(),
					}
				);
			} else {
				console.log("Driver upsert failed:", err);
			}
		}
	};

	/* ---------------- TOGGLE ---------------- */
	const onToggle = async (value: boolean) => {
		setIsActive(value);

		const current = coords
			? coords
			: (await Location.getCurrentPositionAsync({})).coords;

		const c = {
			latitude: current.latitude,
			longitude: current.longitude,
		};

		setCoords(c);
		await upsertDriverLocation(c, value);
	};

	/* ---------------- UI ---------------- */
	return (
		<View style={styles.container}>
			<View className="flex-row">
				<Text className="text-2xl font-lexendBold">HopMate</Text>
				<Text className="ml-2 text-gray-600 capitalize">Driver</Text>
			</View>

			<View style={styles.row}>
				<Text style={styles.status}>{isActive ? "ONLINE" : "OFFLINE"}</Text>
				<Switch value={isActive} onValueChange={onToggle} />
			</View>

			<View style={styles.row}>
				<Text>
					{seatStatus === "AVAILABLE" ? "Seats Available" : "Fully Occupied"}
				</Text>
				<Switch
					value={seatStatus === "AVAILABLE"}
					onValueChange={onSeatToggle}
				/>
			</View>

			<View style={{ marginTop: 24 }}>
				<Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
					Ride Requests
				</Text>

				{requests.length === 0 && (
					<Text style={{ color: "#666" }}>No requests yet</Text>
				)}

				{requests.map((r) => (
					<View key={r.id} style={styles.card}>
						<Text>📍 Destination: {r.destinationName}</Text>
						<Text>🪑 Seats: {r.seatsRequested}</Text>
					</View>
				))}
			</View>

			{coords && (
				<Text style={styles.coords}>
					{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
				</Text>
			)}
		</View>
	);
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 24,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	status: {
		fontSize: 18,
	},
	coords: {
		marginTop: 20,
		color: "#666",
	},
	card: {
		padding: 16,
		borderRadius: 8,
		backgroundColor: "#f0f0f0",
		marginBottom: 12,
	},
});
