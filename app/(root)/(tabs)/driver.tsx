import LocationGate from "@/components/LocationGate";
import AppwriteClientInstance, {
	account,
	databases,
	tableDB,
} from "@/lib/appwrite";
import { type RideRequest, type SeatStatus, type VehicleType } from "@/types";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

/* ================= CONFIG ================= */

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "user_location";

/* ================= COMPONENT ================= */

export default function DriverHome() {
	const [driverId, setDriverId] = useState<string | null>(null);
	const [driverName, setDriverName] = useState<string>("");
	const [carType, setCarType] = useState<string>("");
	const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
	const [vehicleModel, setVehicleModel] = useState<string>("");
	const [plateNumber, setPlateNumber] = useState<string>("");
	const [hasVehicleDetails, setHasVehicleDetails] = useState(true);
	const [showVehicleTypeDropdown, setShowVehicleTypeDropdown] = useState(false);
	const vehicleTypes: { label: string; value: VehicleType }[] = [
		{ label: "Auto", value: "AUTO" },
		{ label: "Bike", value: "BIKE" },
		{ label: "SUV", value: "SUV" },
		{ label: "Sedan", value: "SEDAN" },
	];
	const [isActive, setIsActive] = useState(false);
	const [requests, setRequests] = useState<RideRequest[]>([]);
	const [seatStatus, setSeatStatus] = useState<SeatStatus>("AVAILABLE");
	const [coords, setCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	/* ---------------- AUTH & PROFILE LOAD ---------------- */
	useEffect(() => {
		const loadUser = async () => {
			try {
				const user = await account.get();
				setDriverId(user.$id);
				setDriverName(user.name || "Unknown Driver");

				const profile = await tableDB.getRow({
					databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
					tableId: process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!,
					rowId: user.$id,
				});

				setCarType(profile?.CarType || "");
				setVehicleType((profile?.VehicleType as VehicleType) || "");
				setVehicleModel(profile?.VehicleModel || "");
				setPlateNumber(profile?.PlateNumber || "");

				// Check if vehicle type, model, or plate number is null/empty
				// Show vehicle form only if ANY of these fields are missing
				const vehicleTypeExists =
					profile?.VehicleType !== null && profile?.VehicleType !== "";
				const vehicleModelExists =
					profile?.VehicleModel !== null && profile?.VehicleModel !== "";
				const plateNumberExists =
					profile?.PlateNumber !== null && profile?.PlateNumber !== "";

				const hasDetails =
					vehicleTypeExists && vehicleModelExists && plateNumberExists;
				setHasVehicleDetails(hasDetails);
			} catch (err) {
				console.error("Error loading driver:", err);
			}
		};

		loadUser();
	}, []);

	/* ---------------- SEAT STATUS TOGGLE ---------------- */
	const onSeatToggle = async (value: boolean) => {
		const status: SeatStatus = value ? "AVAILABLE" : "FULL";
		setSeatStatus(status);

		if (!coords || !driverId) return;

		await upsertDriverLocation(coords, isActive, status);
	};

	/* ---------------- RIDE REQUESTS WATCHER ---------------- */
	useEffect(() => {
		if (!driverId) return;

		const channel = `databases.${DATABASE_ID}.collections.ride_requests.documents`;

		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
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
			},
		);

		return () => unsubscribe();
	}, [driverId]);

	/* ---------------- UPSERT DRIVER LOCATION & INFO ---------------- */
	const upsertDriverLocation = async (
		location: { latitude: number; longitude: number },
		active: boolean,
		status: SeatStatus = seatStatus,
	) => {
		if (!driverId) return;

		const payload = {
			DriverId: driverId,
			DriverLatitude: location.latitude,
			DriverLongitude: location.longitude,
			seatStatus: status,
			isActive: active,
		};

		try {
			await databases.updateDocument(
				DATABASE_ID,
				COLLECTION_ID,
				driverId,
				payload,
			);
		} catch (err: any) {
			if (err.code === 404) {
				await databases.createDocument(
					DATABASE_ID,
					COLLECTION_ID,
					driverId,
					payload,
				);
			} else {
				console.error("Driver upsert failed:", err);
			}
		}
	};
	/* -------- SAVE VEHICLE DETAILS -------- */
	const saveVehicleDetails = async () => {
		if (!vehicleType || !vehicleModel || !plateNumber || !driverId) {
			alert("Please fill in all vehicle details");
			return;
		}

		try {
			await tableDB.updateRow({
				databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
				tableId: process.env.EXPO_PUBLIC_APPWRITE_DRIVER_COLLECTION_ID!,
				rowId: driverId,
				data: {
					VehicleType: vehicleType,
					VehicleModel: vehicleModel,
					PlateNumber: plateNumber,
				},
			});

			setHasVehicleDetails(true);
			alert("Vehicle details saved successfully!");
		} catch (err) {
			console.error("Error saving vehicle details:", err);
			alert("Failed to save vehicle details");
		}
	};

	/* -------- VEHICLE DETAILS FORM -------- */
	if (!hasVehicleDetails) {
		return (
			<ScrollView
				style={styles.container}
				contentContainerStyle={{ paddingBottom: 30 }}
			>
				<View className="mt-8 mb-6">
					<Text className="text-2xl font-lexendBold text-gray-800 mb-2">
						Vehicle Details
					</Text>
					<Text className="text-gray-600 font-lexendSemiBold">
						Please add your vehicle information to start driving
					</Text>
				</View>

				{/* VEHICLE TYPE DROPDOWN */}
				<View className="mb-5">
					<Text className="font-lexendSemiBold text-gray-700 mb-2">
						Vehicle Type
					</Text>
					<TouchableOpacity
						onPress={() => setShowVehicleTypeDropdown(!showVehicleTypeDropdown)}
						className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
					>
						<Text className="text-gray-800">
							{vehicleType
								? vehicleTypes.find((v) => v.value === vehicleType)?.label
								: "Select vehicle type"}
						</Text>
					</TouchableOpacity>

					{showVehicleTypeDropdown && (
						<View className="border border-gray-300 border-t-0 rounded-b-lg bg-white">
							{vehicleTypes.map((type) => (
								<TouchableOpacity
									key={type.value}
									onPress={() => {
										setVehicleType(type.value);
										setShowVehicleTypeDropdown(false);
									}}
									className="px-3 py-3 border-b border-gray-200"
								>
									<Text className="text-gray-800">{type.label}</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{/* VEHICLE MODEL */}
				<View className="mb-5">
					<Text className="font-lexendSemiBold text-gray-700 mb-2">
						Vehicle Model
					</Text>
					<TextInput
						placeholder="e.g., Honda Civic, Toyota Prius"
						placeholderTextColor="#999"
						value={vehicleModel}
						onChangeText={setVehicleModel}
						className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
					/>
				</View>

				{/* PLATE NUMBER */}
				<View className="mb-6">
					<Text className="font-lexendSemiBold text-gray-700 mb-2">
						Plate Number
					</Text>
					<TextInput
						placeholder="e.g., MH 01 AB 1234"
						placeholderTextColor="#999"
						value={plateNumber}
						onChangeText={(text) => setPlateNumber(text.toUpperCase())}
						className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
					/>
				</View>

				{/* SAVE BUTTON */}
				<TouchableOpacity
					onPress={saveVehicleDetails}
					className="bg-blue-600 rounded-lg py-4 items-center mb-4"
				>
					<Text className="text-white font-lexendBold text-base">
						Save Vehicle Details
					</Text>
				</TouchableOpacity>
			</ScrollView>
		);
	}
	/* ---------------- TOGGLE ONLINE/OFFLINE ---------------- */
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
		await upsertDriverLocation(c, value, seatStatus);
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
		<LocationGate>
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

				{/* SEAT STATUS TOGGLE */}
				<TouchableOpacity
					disabled={!isActive}
					onPress={() =>
						onSeatToggle(seatStatus === "AVAILABLE" ? false : true)
					}
					className={`flex-row items-center justify-around border mt-2 p-1 rounded-full ${
						isActive && seatStatus === "AVAILABLE"
							? "bg-green-500"
							: isActive && seatStatus === "FULL"
								? "bg-red-500"
								: "bg-gray-400"
					}`}
				>
					<Text className="text-white text-sm font-lexendSemiBold p-2">
						{isActive && seatStatus === "AVAILABLE"
							? "Seats Available"
							: isActive && seatStatus === "FULL"
								? "Seats Full"
								: "Driver Offline"}
					</Text>
				</TouchableOpacity>

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
			</View>
		</LocationGate>
	);
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		marginTop: 20,
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
