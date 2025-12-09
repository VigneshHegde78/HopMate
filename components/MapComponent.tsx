import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, {
	Marker,
	PROVIDER_DEFAULT,
	Region,
	UrlTile,
} from "react-native-maps";

interface Coords {
	latitude: number;
	longitude: number;
	latitudeDelta?: number;
	longitudeDelta?: number;
}

interface MapComponentProps {
	initialCoords?: Coords;
	showUser?: boolean;
}

// Default export a single React component
export default function MapComponent({
	initialCoords,
	showUser = true,
}: MapComponentProps) {
	const [region, setRegion] = useState<Region>(
		(initialCoords as Region) || {
			latitude: 12.9716,
			longitude: 77.5946,
			latitudeDelta: 0.05,
			longitudeDelta: 0.05,
		}
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Optionally request device location and center map
		(async () => {
			if (!showUser) return;
			try {
				setLoading(true);
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					setError("Location permission not granted");
					setLoading(false);
					return;
				}
				const pos = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Highest,
				});
				const { latitude, longitude } = pos.coords;
				setRegion((r) => ({ ...r, latitude, longitude }));
			} catch (e: unknown) {
				if (e instanceof Error) setError(e.message);
				else setError(String(e));
			} finally {
				setLoading(false);
			}
		})();
	}, [showUser]);

	if (loading) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (error) {
		return (
			<View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					padding: 16,
				}}
			>
				<Text>Map error: {error}</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<MapView
				style={{ flex: 1 }}
				provider={PROVIDER_DEFAULT}
				initialRegion={region}
				region={region}
				showsUserLocation={showUser}
				showsMyLocationButton={showUser}
				onRegionChangeComplete={(r: Region) => setRegion(r)}
			>
				{/* OpenStreetMap tiles as a tile overlay */}
				<UrlTile
					// Use the OSM tile server. For production hosting, use your own tile provider or a tile CDN.
					urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
					maximumZ={19}
					flipY={false}
				/>

				{/* Example marker at the center */}
				<Marker
					coordinate={{
						latitude: region.latitude,
						longitude: region.longitude,
					}}
				/>
			</MapView>
		</View>
	);
}
