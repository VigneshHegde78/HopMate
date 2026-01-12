import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import * as Location from "expo-location";
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";

export type MapController = {
	animateTo: (
		coord: { latitude: number; longitude: number },
		durationMs?: number
	) => void;
};

const fallbackRegion: Region = {
	latitude: 19.3036,
	longitude: 72.8602,
	latitudeDelta: 0.0922,
	longitudeDelta: 0.0421,
};

// Calculate distance between two coordinates in kilometers
function distanceKm(
	coord1: { latitude: number; longitude: number },
	coord2: { latitude: number; longitude: number }
): number {
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
}

// Decode Google encoded polyline string to coordinates
function decodePolyline(
	encoded: string
): { latitude: number; longitude: number }[] {
	let index = 0;
	const len = encoded.length;
	const path: { latitude: number; longitude: number }[] = [];
	let lat = 0;
	let lng = 0;

	while (index < len) {
		let b;
		let shift = 0;
		let result = 0;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		const dlat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += dlat;

		shift = 0;
		result = 0;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		const dlng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += dlng;

		path.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
	}
	return path;
}

type DriverMarker = {
	id: number;
	latitude: number;
	longitude: number;
	title: string;
	distance?: number;
};

export default forwardRef<
	MapController,
	{
		destination?: { latitude: number; longitude: number; title?: string };
		radiusKm?: number;
		onNearbyDriversChange?: (drivers: DriverMarker[]) => void;
	}
>(function MapComponent(
	{ destination, radiusKm = 3, onNearbyDriversChange },
	ref
) {
	const mapRef = useRef<MapView>(null);
	const [initialRegion, setInitialRegion] = useState<Region | null>(null);
	const [userCoord, setUserCoord] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [driverMarkers, setDriverMarkers] = useState<DriverMarker[]>([]);
	const [routeCoords, setRouteCoords] = useState<
		{ latitude: number; longitude: number }[]
	>([]);
	// Keep local region if needed later; not used currently

	useImperativeHandle(ref, () => ({
		animateTo: (coord, durationMs = 600) => {
			if (!coord || !mapRef.current) return;
			const latitudeDelta = 0.02;
			const longitudeDelta = 0.02;
			mapRef.current.animateToRegion(
				{ ...coord, latitudeDelta, longitudeDelta },
				durationMs
			);
		},
	}));

	useEffect(() => {
		(async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					setInitialRegion(fallbackRegion);
					return;
				}
				const loc = await Location.getCurrentPositionAsync({});
				const { latitude, longitude } = loc.coords;
				setInitialRegion({
					latitude,
					longitude,
					latitudeDelta: fallbackRegion.latitudeDelta,
					longitudeDelta: fallbackRegion.longitudeDelta,
				});
				setUserCoord({ latitude, longitude });

				// Watch for user location changes to keep filtering accurate
				await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.Balanced,
						timeInterval: 5000,
						distanceInterval: 25,
					},
					(location) => {
						setUserCoord({
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
						});
					}
				);
			} catch (error) {
				console.warn("Failed to get location:", error);
				setInitialRegion(fallbackRegion);
			}
		})();
	}, []);

	const generateMockDrivers = useCallback(
		(
			origin?: { latitude: number; longitude: number },
			count: number = 6,
			spreadKm: number = Math.max(1, radiusKm)
		): DriverMarker[] => {
			const base = origin ?? {
				latitude: initialRegion?.latitude ?? fallbackRegion.latitude,
				longitude: initialRegion?.longitude ?? fallbackRegion.longitude,
			};
			const degPerKmLat = 1 / 111.32; // ~0.008983 degrees per km
			const cosLat = Math.cos((base.latitude * Math.PI) / 180);
			const degPerKmLon =
				1 / (111.32 * (Math.abs(cosLat) < 0.01 ? 0.01 : Math.abs(cosLat)));

			const mocks: DriverMarker[] = Array.from({ length: count }).map(
				(_, i) => {
					const randLat = (Math.random() - 0.5) * 2 * spreadKm * degPerKmLat;
					const randLon = (Math.random() - 0.5) * 2 * spreadKm * degPerKmLon;
					return {
						id: 100000 + i,
						latitude: base.latitude + randLat,
						longitude: base.longitude + randLon,
						title: `Mock Driver ${i + 1}`,
					};
				}
			);
			return mocks;
		},
		[initialRegion, radiusKm]
	);

	// Fetch initial driver locations and subscribe to realtime updates (Appwrite)
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
				const markers: DriverMarker[] = rows.map((d: any) => ({
					id: d.driver_id,
					latitude: d.latitude,
					longitude: d.longitude,
					title: `${d.first_name ?? "Driver"} ${d.last_name ?? ""}`.trim(),
				}));
				if (!markers.length) {
					const origin = userCoord ??
						(initialRegion && {
							latitude: initialRegion.latitude,
							longitude: initialRegion.longitude,
						}) ?? {
							latitude: fallbackRegion.latitude,
							longitude: fallbackRegion.longitude,
						};
					setDriverMarkers(generateMockDrivers(origin));
				} else {
					setDriverMarkers(markers);
				}
			} catch (e) {
				console.warn("Failed to fetch drivers", e);
				const origin = userCoord ??
					(initialRegion && {
						latitude: initialRegion.latitude,
						longitude: initialRegion.longitude,
					}) ?? {
						latitude: fallbackRegion.latitude,
						longitude: fallbackRegion.longitude,
					};
				setDriverMarkers(generateMockDrivers(origin));
			}
		};

		const subscribeRealtime = () => {
			if (!databaseId || !collectionId) return;
			const channel = `databases.${databaseId}.collections.${collectionId}.documents`;
			const sub = AppwriteClientInstance.subscribe(channel, (event: any) => {
				const doc = event?.payload as any;
				if (!doc) return;
				setDriverMarkers((prev) => {
					const title =
						`${doc.first_name ?? "Driver"} ${doc.last_name ?? ""}`.trim();
					const existingIdx = prev.findIndex((m) => m.id === doc.UserId);
					const updated = {
						id: doc.UserId,
						latitude: doc.CurruntLatitude,
						longitude: doc.CurruntLongitude,
						title,
					} as DriverMarker;
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
	}, [initialRegion, userCoord, generateMockDrivers]);

	// Fetch and display route polyline from current location to destination
	useEffect(() => {
		const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
		const fetchRoute = async () => {
			if (!apiKey || !userCoord || !destination) {
				setRouteCoords([]);
				return;
			}
			try {
				const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userCoord.latitude},${userCoord.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${apiKey}`;
				const res = await fetch(url);
				const json = await res.json();
				const points: string | undefined =
					json?.routes?.[0]?.overview_polyline?.points;
				if (!points) {
					setRouteCoords([]);
					return;
				}
				const coords = decodePolyline(points);
				setRouteCoords(coords);
				if (coords.length && mapRef.current) {
					mapRef.current.fitToCoordinates(coords, {
						edgePadding: { top: 80, right: 40, bottom: 120, left: 40 },
						animated: true,
					});
				}
			} catch {
				setRouteCoords([]);
			}
		};
		fetchRoute();
	}, [userCoord, destination]);

	// Emit nearby drivers to parent for bottom sheet
	useEffect(() => {
		if (!userCoord) return;
		const nearby = driverMarkers
			.map((m) => {
				const d = distanceKm(userCoord, {
					latitude: m.latitude,
					longitude: m.longitude,
				});
				return { ...m, distance: d } as DriverMarker;
			})
			.filter((m) => (m.distance ?? Infinity) <= radiusKm);
		onNearbyDriversChange?.(nearby);
	}, [driverMarkers, userCoord, radiusKm, onNearbyDriversChange]);

	if (!initialRegion) {
		return <View style={styles.container} />;
	}

	return (
		<View style={styles.container}>
			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={initialRegion}
				mapType="standard"
				showsUserLocation
				rotateEnabled={false}
				scrollEnabled
				zoomEnabled
				pitchEnabled={false}
				showsCompass
				showsScale
				showsTraffic={false}
				showsBuildings={false}
				showsIndoors={false}
				userInterfaceStyle="light"
				showsMyLocationButton
			>
				<Marker
					coordinate={{
						latitude: initialRegion.latitude,
						longitude: initialRegion.longitude,
					}}
				/>

				{/* Nearby driver markers within radius */}
				{userCoord
					? driverMarkers
							.filter(
								(m) =>
									distanceKm(userCoord, {
										latitude: m.latitude,
										longitude: m.longitude,
									}) <= radiusKm
							)
							.map((m) => (
								<Marker
									key={`driver-${m.id}`}
									coordinate={{ latitude: m.latitude, longitude: m.longitude }}
									title={m.title}
									description={`Within ${radiusKm} km`}
									icon={require("../assets/icons/marker.png")}
								/>
							))
					: null}

				{destination ? (
					<Marker
						coordinate={{
							latitude: destination.latitude,
							longitude: destination.longitude,
						}}
						title={destination.title || "Destination"}
						pinColor="#2e7d32"
					/>
				) : null}

				{routeCoords.length > 0 ? (
					<Polyline
						coordinates={routeCoords}
						strokeColor="#0066FF"
						strokeWidth={5}
					/>
				) : null}
			</MapView>
		</View>
	);
});

// Removed duplicate styles declaration

// Removed duplicate import and fallbackRegion declaration

// (Removed secondary test component to avoid unused warnings)

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		width: "100%",
		height: "100%",
	},
});
