import LocationGate from "@/components/LocationGate";
import AppwriteClientInstance, { account, databases } from "@/lib/appwrite";
import { type RideRequest, type SeatStatus, type VehicleType } from "@/types";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Query } from "react-native-appwrite";

/* ================= CONFIG ================= */

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "user_location";

/* ================= COMPONENT ================= */

export default function DriverHome() {
	const [driverId, setDriverId] = useState<string | null>(null);
	const [driverName, setDriverName] = useState<string>("");
	const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
	const [vehicleModel, setVehicleModel] = useState<string>("");
	const [plateNumber, setPlateNumber] = useState<string>("");
	const [hasVehicleDetails, setHasVehicleDetails] = useState(true);
	const [isEditingVehicle, setIsEditingVehicle] = useState(false);
	const [showVehicleTypeDropdown, setShowVehicleTypeDropdown] = useState(false);
	const vehicleTypes: { label: string; value: VehicleType }[] = [
		{ label: "Auto", value: "AUTO" },
		{ label: "Bike", value: "BIKE" },
		{ label: "SUV", value: "SUV" },
		{ label: "Sedan", value: "SEDAN" },
	];
	const [isActive, setIsActive] = useState(false);
	const [requests, setRequests] = useState<RideRequest[]>([]);
	const [activeRides, setActiveRides] = useState<RideRequest[]>([]);
	const [seatStatus, setSeatStatus] = useState<SeatStatus>("AVAILABLE");
	const [coords, setCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	const vehicleTypeLabelMap: Record<VehicleType, string> = {
		AUTO: "Auto",
		BIKE: "Bike",
		SUV: "SUV",
		SEDAN: "Sedan",
	};

	const vehicleImageMap: Record<VehicleType, any> = {
		AUTO: require("@/assets/images/rickshaw.png"),
		BIKE: require("@/assets/images/bike.png"),
		SUV: require("@/assets/images/suv.png"),
		SEDAN: require("@/assets/images/sedan.png"),
	};

	/* ---------------- AUTH & PROFILE LOAD ---------------- */
	useEffect(() => {
		const loadUser = async () => {
			try {
				const user = await account.get();
				setDriverId(user.$id);
				setDriverName(user.name || "Driver #" + user.$id.substring(0, 5));

				const locationDoc = await databases.getDocument(
					DATABASE_ID,
					COLLECTION_ID,
					user.$id,
				);

				setVehicleType((locationDoc?.VehicleType as VehicleType) || "");
				setVehicleModel(locationDoc?.VehicleModel || "");
				setPlateNumber(locationDoc?.PlateNumber || "");

				// Check if vehicle type, model, or plate number is null/empty
				// Show vehicle form only if ANY of these fields are missing
				const vehicleTypeExists =
					locationDoc?.VehicleType !== null && locationDoc?.VehicleType !== "";
				const vehicleModelExists =
					locationDoc?.VehicleModel !== null &&
					locationDoc?.VehicleModel !== "";
				const plateNumberExists =
					locationDoc?.PlateNumber !== null && locationDoc?.PlateNumber !== "";

				const hasDetails =
					vehicleTypeExists && vehicleModelExists && plateNumberExists;
				setHasVehicleDetails(hasDetails);
			} catch (err: any) {
				if (err?.code === 404) {
					setVehicleType("");
					setVehicleModel("");
					setPlateNumber("");
					setHasVehicleDetails(false);
					return;
				}

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

		const loadDriverRides = async () => {
			try {
				const pendingRes = await databases.listDocuments(
					DATABASE_ID,
					"ride_requests",
					[
						Query.equal("DriverId", driverId),
						Query.equal("Status", "PENDING"),
						Query.orderDesc("$createdAt"),
					],
				);

				setRequests(
					pendingRes.documents.map((doc: any) => ({
						id: doc.$id,
						destinationName: doc.DestinationName,
						seatsRequested: doc.SeatsRequested,
					})),
				);

				const acceptedRes = await databases.listDocuments(
					DATABASE_ID,
					"ride_requests",
					[
						Query.equal("DriverId", driverId),
						Query.equal("Status", "ACCEPTED"),
						Query.orderDesc("$createdAt"),
					],
				);

				setActiveRides(
					acceptedRes.documents.map((doc: any) => ({
						id: doc.$id,
						destinationName: doc.DestinationName,
						seatsRequested: doc.SeatsRequested,
					})),
				);
			} catch (err) {
				console.error("Error loading driver rides:", err);
			}
		};

		loadDriverRides();

		const channel = `databases.${DATABASE_ID}.collections.ride_requests.documents`;

		const unsubscribe = AppwriteClientInstance.subscribe(
			channel,
			(event: any) => {
				const doc = event.payload;
				if (!doc) return;
				if (doc.DriverId !== driverId) return;

				const ride: RideRequest = {
					id: doc.$id,
					destinationName: doc.DestinationName,
					seatsRequested: doc.SeatsRequested,
				};

				if (doc.Status === "PENDING") {
					setRequests((prev) => {
						if (prev.find((r) => r.id === ride.id)) return prev;
						return [...prev, ride];
					});
					setActiveRides((prev) => prev.filter((r) => r.id !== ride.id));
					return;
				}

				if (doc.Status === "ACCEPTED") {
					setRequests((prev) => prev.filter((r) => r.id !== ride.id));
					setActiveRides((prev) => {
						if (prev.find((r) => r.id === ride.id)) return prev;
						return [...prev, ride];
					});
					return;
				}

				setRequests((prev) => prev.filter((r) => r.id !== ride.id));
				setActiveRides((prev) => prev.filter((r) => r.id !== ride.id));
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
			await databases.updateDocument(DATABASE_ID, COLLECTION_ID, driverId, {
				VehicleType: vehicleType,
				VehicleModel: vehicleModel,
				PlateNumber: plateNumber,
			});

			setHasVehicleDetails(true);
			setIsEditingVehicle(false);
			setShowVehicleTypeDropdown(false);
			alert("Vehicle details saved successfully!");
		} catch (err: any) {
			if (err?.code === 404) {
				try {
					await databases.createDocument(DATABASE_ID, COLLECTION_ID, driverId, {
						DriverId: driverId,
						DriverLatitude: coords?.latitude ?? 0,
						DriverLongitude: coords?.longitude ?? 0,
						seatStatus,
						isActive,
						VehicleType: vehicleType,
						VehicleModel: vehicleModel,
						PlateNumber: plateNumber,
					});
					setHasVehicleDetails(true);
					setIsEditingVehicle(false);
					setShowVehicleTypeDropdown(false);
					alert("Vehicle details saved successfully!");
				} catch (createErr) {
					console.error("Error creating driver details:", createErr);
					alert("Failed to save vehicle details");
				}
				return;
			}

			console.error("Error saving vehicle details:", err);
			alert("Failed to save vehicle details");
		}
	};

	const onEditVehicleSelected = () => {
		setIsEditingVehicle(true);
		setShowVehicleTypeDropdown(false);
	};

	/* -------- VEHICLE DETAILS FORM -------- */
	if (!hasVehicleDetails || isEditingVehicle) {
		return (
			<ScrollView
				style={styles.container}
				contentContainerStyle={{ paddingBottom: 30 }}
			>
				<View className="mt-8 mb-6">
					<Text className="text-2xl font-lexendBold text-gray-800 mb-2">
						{isEditingVehicle ? "Edit Vehicle Details" : "Vehicle Details"}
					</Text>
					<Text className="text-gray-600 font-lexendSemiBold">
						{isEditingVehicle
							? "Update your vehicle information"
							: "Please add your vehicle information to start driving"}
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

				{hasVehicleDetails && isEditingVehicle && (
					<TouchableOpacity
						onPress={() => {
							setIsEditingVehicle(false);
							setShowVehicleTypeDropdown(false);
						}}
						className="border border-gray-300 rounded-lg py-4 items-center"
					>
						<Text className="text-gray-700 font-lexendSemiBold text-base">
							Cancel
						</Text>
					</TouchableOpacity>
				)}
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

	const completeRide = async (requestId: string) => {
		await databases.updateDocument(DATABASE_ID, "ride_requests", requestId, {
			Status: "COMPLETED",
		});
	};

	const selectedVehicleLabel = vehicleType
		? vehicleTypeLabelMap[vehicleType]
		: "Vehicle";
	const selectedVehicleImage = vehicleType
		? vehicleImageMap[vehicleType]
		: vehicleImageMap.BIKE;

	/* ---------------- UI ---------------- */
	return (
		<LocationGate>
			<View style={styles.container}>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-end">
						<Text className="text-3xl font-lexendBold">HopMate</Text>
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

				{/* ---------------- Vehicle INFO card ---------------- */}
				<View className="flex-row justify-between bg-[#efefef] rounded-lg mt-4 shadow-sm">
					<View className="flex-col items-start gap-1 justify-end ml-5 mb-5">
						<Text className="font-lexendBold text-2xl text-gray-600">
							{selectedVehicleLabel}
						</Text>
						<View>
							<Text className="font-lexendSemiBold text-lg text-gray-500">
								{vehicleModel}
							</Text>
							<Text className="font-lexendSemiBold text-lg text-gray-500">
								{plateNumber}
							</Text>
						</View>
					</View>
					<View className="flex rounded-r-lg overflow-hidden">
						<Image
							source={selectedVehicleImage}
							className="h-36 w-48"
							resizeMode="contain"
						/>
					</View>
					<TouchableOpacity
						onPress={onEditVehicleSelected}
						className="absolute bottom-3 right-3 bg-white p-1 rounded-full shadow-sm"
					>
						<MaterialIcons name="edit" size={24} color="gray" />
					</TouchableOpacity>
				</View>

				{/* ---------------- RIDE REQUESTS ---------------- */}
				<View className="flex-1 mt-6">
					{activeRides.map((r) => (
						<View
							key={`active-${r.id}`}
							className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100"
						>
							<View className="flex-row items-center justify-between mb-4">
								<View className="flex-row items-center flex-1 mr-3">
									<View className="bg-blue-100 p-2 rounded-full mr-3">
										<MaterialIcons name="location-pin" size={24} color="#2563eb" />
									</View>
									<View className="flex-1">
										<Text className="text-gray-500 text-xs font-lexendSemiBold mb-1">
											ACTIVE RIDE DESTINATION
										</Text>
										<Text className="text-gray-800 text-lg font-lexendBold">
											{r.destinationName}
										</Text>
									</View>
								</View>
								<View className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
									<MaterialIcons name="person" size={16} color="#4b5563" />
									<Text className="text-gray-700 font-lexendBold ml-1">
										{r.seatsRequested}
									</Text>
								</View>
							</View>

							<TouchableOpacity
								onPress={() => completeRide(r.id)}
								className="bg-blue-600 py-3 rounded-lg items-center mt-2 flex-row justify-center"
							>
								<MaterialIcons name="check-circle" size={20} color="#fff" />
								<Text className="text-white font-lexendBold ml-2 text-base">
									Complete Ride
								</Text>
							</TouchableOpacity>
						</View>
					))}

					<View className="flex-row items-center mb-4 mt-2">
						<Text className="text-xl font-lexendBold text-gray-800 mr-2">
							Ride Requests
						</Text>
						{requests.length > 0 && (
							<View className="bg-blue-100 px-2.5 py-1 rounded-full">
								<Text className="text-blue-700 font-lexendBold text-xs">
									{requests.length} NEW
								</Text>
							</View>
						)}
					</View>

					<View
						className={`flex w-full h-96 ${requests.length === 0 ? "items-center" : ""}`}
					>
						{requests.length === 0 && (
							<View className="items-center justify-center mt-10">
								<MaterialIcons name="hourglass-empty" size={48} color="#d1d5db" />
								<Text className="text-center text-gray-500 mt-4 font-lexendSemiBold">
									No requests at the moment
								</Text>
							</View>
						)}

						<ScrollView showsVerticalScrollIndicator={false}>
							{requests.map((r) => (
								<View
									key={r.id}
									className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100"
								>
									<View className="flex-row items-center justify-between mb-4">
										<View className="flex-row items-center flex-1 mr-3">
											<View className="bg-gray-100 p-2 rounded-full mr-3">
												<MaterialIcons name="place" size={24} color="#4b5563" />
											</View>
											<View className="flex-1">
												<Text className="text-gray-500 text-xs font-lexendSemiBold mb-1">
													DESTINATION
												</Text>
												<Text className="text-gray-800 text-lg font-lexendBold">
													{r.destinationName}
												</Text>
											</View>
										</View>
										<View className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
											<MaterialIcons name="person" size={16} color="#4b5563" />
											<Text className="text-gray-700 font-lexendBold ml-1">
												{r.seatsRequested}
											</Text>
										</View>
									</View>

									<View className="flex-row gap-3 mt-2">
										<TouchableOpacity
											onPress={() => rejectRequest(r.id)}
											className="flex-1 bg-red-100 py-3 rounded-lg items-center flex-row justify-center"
										>
											<MaterialIcons name="close" size={20} color="#dc2626" />
											<Text className="text-red-600 font-lexendBold ml-1 text-base">
												Reject
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											onPress={() => acceptRequest(r.id)}
											className="flex-1 bg-green-600 py-3 rounded-lg items-center flex-row justify-center"
										>
											<MaterialIcons name="check" size={20} color="#fff" />
											<Text className="text-white font-lexendBold ml-1 text-base">
												Accept
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</ScrollView>
					</View>
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
