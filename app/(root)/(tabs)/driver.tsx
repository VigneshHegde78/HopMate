import appwriteClient, { account, databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

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
			SeatStatus: status,
			lastUpdatedAt: new Date().toISOString(),
		});
	};

	/* ---------------- LOCATION WATCHER ---------------- */
	useEffect(() => {
		if (!driverId) return;

		const channel = `databases.${DATABASE_ID}.collections.ride_requests.documents`;

		const unsubscribe = appwriteClient.subscribe(channel, (event: any) => {
			const doc = event.payload;
			if (!doc) return;
			if (doc.DriverId !== driverId) return;

			setRequests((prev) => {
				if (doc.Status !== "PENDING") {
					return prev.filter((r) => r.id !== doc.$id);
				}

				if (prev.find((r) => r.id === doc.$id)) return prev;

				return [
					...prev,
					{
						id: doc.$id,
						destinationName: doc.DestinationName,
						seatsRequested: doc.SeatsRequested,
					},
				];
			});
		});

		return () => unsubscribe();
	}, [driverId]);

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

	const acceptRequest = async (requestId: string) => {
		await databases.updateDocument(DATABASE_ID, "ride_requests", requestId, {
			Status: "ACCEPTED",
		});
	};

	const rejectRequest = async (requestId: string) => {
		await databases.updateDocument(DATABASE_ID, "ride_requests", requestId, {
			Status: "REJECTED",
		});
	};

	/* ---------------- UI ---------------- */
	return (
		<View style={styles.container}>
			<View className="flex-row items-center justify-between">
				<View className="flex-row items-end">
					<Text className="text-2xl font-lexendBold">HopMate</Text>
					<Text className="ml-1.5 mb-0.5 text-gray-600 font-lexendSemiBold text-sm">
						Driver
					</Text>
				</View>
				<View className="flex-row items-center gap-1">
					<View
						className={`${isActive ? "bg-green-600" : "bg-red-500"} p-1 rounded-full`}
					/>
					<Text
						className={`font-lexendSemiBold ${isActive ? "text-green-600" : "text-red-500"}`}
					>
						{isActive ? "Online" : "Offline"}
					</Text>
				</View>
			</View>

			{/* ---------------- STATUS TOGGLE ---------------- */}
			<View className="bg-gray-200 flex-row items-center justify-between mt-6 mb-2 px-3 rounded-xl shadow-black/10 shadow-sm">
				<Text className="font-lexendSemiBold">Driver Status</Text>
				<Switch value={isActive} onValueChange={onToggle} />
			</View>

			{/* ---------------- SEAT STATUS TOGGLE ( Only when driver is active  ) ---------------- */}
			<View className="bg-white flex-row items-center justify-between mt-6 mb-4 px-3 rounded-xl ">
				<Text>
					{seatStatus === "AVAILABLE" ? "Seats Available" : "Fully Occupied"}
				</Text>
				<Switch
					value={seatStatus === "AVAILABLE"}
					onValueChange={onSeatToggle}
				/>
			</View>

			<View style={{ marginTop: 30 }}>
				<Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
					Ride Requests
				</Text>

				{requests.length === 0 && (
					<Text style={{ color: "#666" }}>No requests yet</Text>
				)}

				{requests.map((r) => (
					<View key={r.id} style={styles.card}>
						<Text style={{ marginBottom: 6 }}>
							📍 Destination: {r.destinationName}
						</Text>

						<Text style={{ marginBottom: 8 }}>
							🪑 Seats: {r.seatsRequested}
						</Text>

						<View style={{ flexDirection: "row" }}>
							<TouchableOpacity
								onPress={() => acceptRequest(r.id)}
								style={[styles.btn, { backgroundColor: "green" }]}
							>
								<Text style={{ color: "#fff" }}>Accept</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => rejectRequest(r.id)}
								style={[styles.btn, { backgroundColor: "red" }]}
							>
								<Text style={{ color: "#fff" }}>Reject</Text>
							</TouchableOpacity>
						</View>
					</View>
				))}
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
		padding: 20,
		marginTop: 20,
		justifyContent: "flex-start",
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
		borderBlockColor: "#ddd",
		borderWidth: 1,
		paddingVertical: 12,
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
	btn: {
		padding: 10,
		borderRadius: 6,
		marginRight: 10,
	},
});
