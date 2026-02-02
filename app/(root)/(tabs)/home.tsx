import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import MapComponent, { MapController } from "@/components/MapComponent";
import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const mapRef = useRef<MapController>(null);
	const snapPoints = useMemo(() => ["40%", "85%"], []);
	const insets = useSafeAreaInsets();
	const [destination, setDestination] = useState<Destination | null>(null);
	const [radiusKm, setRadiusKm] = useState<number>(0.5); // 0.5km to 2km
	const [nearbyDrivers, setNearbyDrivers] = useState<
		{
			id: number;
			title: string;
			latitude: number;
			longitude: number;
			distance?: number;
		}[]
	>([]);
	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [allDrivers, setAllDrivers] = useState<
		{
			id: number;
			title: string;
			latitude: number;
			longitude: number;
		}[]
	>([]);

	// Calculate distance between two coordinates in kilometers
	const calculateDistance = (
		coord1: { latitude: number; longitude: number },
		coord2: { latitude: number; longitude: number }
	): number => {
		const R = 6371; // Earth's radius in kilometers
		const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
		const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((coord1.latitude * Math.PI) / 180) *
				Math.cos((coord2.latitude * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	// Get user location
	useEffect(() => {
		(async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					console.warn("Location permission not granted");
					return;
				}
				const loc = await Location.getCurrentPositionAsync({});
				setUserLocation({
					latitude: loc.coords.latitude,
					longitude: loc.coords.longitude,
				});

				// Watch for location changes
				await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.Balanced,
						timeInterval: 5000,
						distanceInterval: 25,
					},
					(location) => {
						setUserLocation({
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
						});
					}
				);
			} catch (error) {
				console.error("Failed to get location:", error);
			}
		})();
	}, []);

	// Fetch drivers from Appwrite and subscribe to realtime updates
	useEffect(() => {
		const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID as string;
		const collectionId =
			(process.env.EXPO_PUBLIC_APPWRITE_DRIVER_COLLECTION_ID as string) ||
			"location";

		let unsubscribe: (() => void) | null = null;

		const fetchDrivers = async () => {
			try {
				if (!databaseId || !collectionId) {
					console.warn(
						"Missing Appwrite database/collection ids for driver locations."
					);
					return;
				}
				const res = await databases.listDocuments(databaseId, collectionId);

				const rows = (res?.documents ?? []) as any[];
				console.log("Fetched drivers from Appwrite:", rows);
				const drivers = rows.map((d: any) => ({
					id: d.UserId,
					latitude: parseFloat(d.DriverLatitude),
					longitude: parseFloat(d.DriverLongitude),
					title: `${d.first_name ?? "Driver"} ${d.last_name ?? ""}`.trim(),
				}));
				setAllDrivers(drivers);
			} catch (e) {
				console.error("Error fetching drivers:", e);
				setAllDrivers([]);
			}
		};

		const subscribeRealtime = () => {
			if (!databaseId || !collectionId) return;
			const channel = `databases.${databaseId}.collections.${collectionId}.documents`;
			const sub = AppwriteClientInstance.subscribe(channel, (event: any) => {
				const doc = event?.payload as any;
				if (!doc) return;
				setAllDrivers((prev) => {
					const title =
						`${doc.first_name ?? "Driver"} ${doc.last_name ?? ""}`.trim();
					const existingIdx = prev.findIndex((m) => m.id === doc.UserId);
					const updated = {
						id: doc.UserId,
						latitude: parseFloat(doc.DriverLatitude),
						longitude: parseFloat(doc.DriverLongitude),
						title,
					};
					if (existingIdx >= 0) {
						const next = prev.slice();
						next[existingIdx] = updated;
						return next;
					}
					return [...prev, updated];
				});
			});
			unsubscribe = () => sub();
		};

		fetchDrivers();
		subscribeRealtime();

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, []);

	// Calculate nearby drivers based on user location, radius, and fetched drivers
	useEffect(() => {
		if (!userLocation || allDrivers.length === 0) {
			setNearbyDrivers([]);
			return;
		}

		const driversWithDistance = allDrivers
			.map((driver) => {
				const distance = calculateDistance(userLocation, {
					latitude: driver.latitude,
					longitude: driver.longitude,
				});
				return { ...driver, distance };
			})
			.filter((driver) => driver.distance <= radiusKm)
			.sort((a, b) => a.distance - b.distance);

		setNearbyDrivers(driversWithDistance);
		console.log(
			`Found ${driversWithDistance.length} drivers within ${radiusKm} km`,
			driversWithDistance
		);
	}, [userLocation, allDrivers, radiusKm]);

	// Calculate and sort nearby drivers by distance
	const handleNearbyDriversUpdate = (drivers: typeof nearbyDrivers) => {
		// Sort drivers by distance (closest first)
		const sortedDrivers = [...drivers].sort(
			(a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
		);
		setNearbyDrivers(sortedDrivers);
		console.log(
			`Found ${sortedDrivers.length} nearby drivers within ${radiusKm} km`,
			sortedDrivers
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<MapComponent
				ref={mapRef}
				destination={
					destination
						? {
								latitude: destination.latitude,
								longitude: destination.longitude,
								title: destination.name,
							}
						: undefined
				}
				radiusKm={radiusKm}
				onNearbyDriversChange={handleNearbyDriversUpdate}
			/>

			{/* Search overlay */}
			<View
				style={{
					position: "absolute",
					top: insets.top + 12,
					left: 12,
					right: 12,
				}}
			>
				<DestSearchBar
					onPlaceSelected={(d) => {
						setDestination(d);
						mapRef.current?.animateTo({
							latitude: d.latitude,
							longitude: d.longitude,
						});
					}}
				/>
			</View>
			<BottomSheet
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				enablePanDownToClose={false}
				backgroundStyle={{
					backgroundColor: "#f7f7f7",
				}}
			>
				<BottomSheetView className="flex-1 p-5 bg-[#f7f7f7]">
					{destination ? (
						<View className="mb-3">
							<Text className="font-figtreeMedium text-gray-700">
								Destination
							</Text>
							<Text className="font-figtreeBold text-base">
								{destination.name || "Selected place"}
							</Text>
							{destination.address ? (
								<Text className="font-figtreeLight text-gray-600">
									{destination.address}
								</Text>
							) : null}
						</View>
					) : null}
					<View className="mb-3">
						<Text className="font-figtreeBold text-xl mb-1">
							Nearby Drivers
						</Text>
						<Text className="font-figtreeLight text-gray-600">
							Range: {radiusKm} km
						</Text>

						<View className="flex-row mt-2 gap-2">
							{[0.5, 1.0, 1.5, 2.0].map((r) => (
								<TouchableOpacity
									key={`radius-${r}`}
									className={`px-3 py-2 rounded-md ${radiusKm === r ? "bg-black" : "bg-white"}`}
									onPress={() => setRadiusKm(r)}
								>
									<Text
										className={`${radiusKm === r ? "text-white" : "text-black"}`}
									>
										{r} km
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View className="mb-2">
						<Text className="font-figtreeMedium text-gray-700">
							{nearbyDrivers.length} driver
							{nearbyDrivers.length !== 1 ? "s" : ""} available
						</Text>
					</View>

					<FlatList
						data={nearbyDrivers}
						renderItem={({ item }) => (
							<View className="bg-white mt-2 p-4 rounded-lg shadow-sm">
								<View className="flex-row justify-between items-center mb-2">
									<View className="flex-1">
										<Text className="font-figtreeBold text-lg">
											{item.title}
										</Text>
										<Text className="font-figtreeLight text-gray-500 text-sm">
											Driver ID: {item.id}
										</Text>
									</View>
									<View className="bg-green-100 px-3 py-1 rounded-full">
										<Text className="font-figtreeMedium text-green-700">
											{(item.distance ?? 0).toFixed(2)} km
										</Text>
									</View>
								</View>
								<View className="flex-row gap-2 mt-2">
									<TouchableOpacity className="flex-1 bg-black py-2 rounded-lg">
										<Text className="text-white text-center font-figtreeMedium">
											Request Ride
										</Text>
									</TouchableOpacity>
									<TouchableOpacity className="flex-1 bg-gray-200 py-2 rounded-lg">
										<Text className="text-black text-center font-figtreeMedium">
											View Details
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
						keyExtractor={(item) => item.id.toString()}
						ListEmptyComponent={
							<View className="bg-white p-6 rounded-lg items-center">
								<Text className="font-figtreeMedium text-gray-600 text-center">
									No nearby drivers found within {radiusKm} km
								</Text>
								<Text className="font-figtreeLight text-gray-500 text-center mt-1">
									Try increasing the search radius
								</Text>
							</View>
						}
						showsVerticalScrollIndicator={false}
					/>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
}
