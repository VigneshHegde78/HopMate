import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text as RNText,
	StyleSheet,
	View,
} from "react-native";
import MapView, {
	Circle,
	Marker,
	PROVIDER_DEFAULT,
	Region,
	UrlTile,
} from "react-native-maps";

export interface MapMarker {
	id: string;
	latitude: number;
	longitude: number;
	title?: string;
	description?: string;
	color?: string;
}

interface MapViewComponentProps {
	showUserLocation?: boolean;
	markers?: MapMarker[];
	onRegionChange?: (region: Region) => void;
	onMarkerPress?: (marker: MapMarker) => void;
	initialRegion?: Region;
	showUserLocationCircle?: boolean;
}

export default function MapViewComponent({
	showUserLocation = true,
	markers = [],
	onRegionChange,
	onMarkerPress,
	initialRegion,
	showUserLocationCircle = false,
}: MapViewComponentProps) {
	const mapRef = useRef<MapView>(null);
	const [userLocation, setUserLocation] = useState<Region | null>(
		initialRegion || null
	);
	const [loading, setLoading] = useState(true);
	const [locationError, setLocationError] = useState<string | null>(null);

	useEffect(() => {
		if (initialRegion) {
			setUserLocation(initialRegion);
			setLoading(false);
			return;
		}

		(async () => {
			try {
				// Request location permissions
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					const errorMsg = "Location permission denied";
					setLocationError(errorMsg);
					Alert.alert(
						"Permission Denied",
						"Location permission is required to show your position on the map."
					);

					// Use default location
					const defaultRegion: Region = {
						latitude: 37.78825,
						longitude: -122.4324,
						latitudeDelta: 0.02,
						longitudeDelta: 0.02,
					};
					setUserLocation(defaultRegion);
					setLoading(false);
					return;
				}

				// Get current location
				const location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});

				const region: Region = {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				};

				setUserLocation(region);
				setLoading(false);
				setLocationError(null);

				// Animate to user location
				setTimeout(() => {
					mapRef.current?.animateToRegion(region, 1000);
				}, 100);
			} catch (error) {
				console.error("Error getting location:", error);
				const errorMsg = "Failed to get location";
				setLocationError(errorMsg);

				// Fallback to a default location
				const defaultRegion: Region = {
					latitude: 37.78825,
					longitude: -122.4324,
					latitudeDelta: 0.02,
					longitudeDelta: 0.02,
				};
				setUserLocation(defaultRegion);
				setLoading(false);
			}
		})();
	}, [initialRegion]);

	const handleMarkerPress = useCallback(
		(marker: MapMarker) => {
			if (onMarkerPress) {
				onMarkerPress(marker);
			}
		},
		[onMarkerPress]
	);
	if (loading || !userLocation) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#0066cc" />
				<RNText style={styles.loadingText}>Loading map...</RNText>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{locationError && (
				<View style={styles.errorBanner}>
					<RNText style={styles.errorText}>⚠️ {locationError}</RNText>
				</View>
			)}

			<MapView
				ref={mapRef}
				style={styles.map}
				provider={PROVIDER_DEFAULT}
				initialRegion={userLocation}
				showsUserLocation={showUserLocation && !locationError}
				showsMyLocationButton={true}
				showsCompass={true}
				showsScale={true}
				showsTraffic={false}
				showsBuildings={true}
				showsIndoors={true}
				onRegionChangeComplete={onRegionChange}
				rotateEnabled={true}
				pitchEnabled={true}
				scrollEnabled={true}
				zoomEnabled={true}
				zoomControlEnabled={true}
				mapType="standard"
				loadingEnabled={true}
				loadingIndicatorColor="#0066cc"
				loadingBackgroundColor="#f5f5f5"
			>
				{/* OpenStreetMap Tiles */}
				<UrlTile
					urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
					maximumZ={19}
					minimumZ={1}
					flipY={false}
					zIndex={-1}
					shouldReplaceMapContent={true}
				/>

				{/* User location circle */}
				{showUserLocationCircle && userLocation && !locationError && (
					<Circle
						center={{
							latitude: userLocation.latitude,
							longitude: userLocation.longitude,
						}}
						radius={100}
						strokeWidth={2}
						strokeColor="rgba(0, 102, 204, 0.5)"
						fillColor="rgba(0, 102, 204, 0.1)"
					/>
				)}

				{/* Custom Markers */}
				{markers.map((marker) => (
					<Marker
						key={marker.id}
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude,
						}}
						title={marker.title}
						description={marker.description}
						pinColor={marker.color || "red"}
						onPress={() => handleMarkerPress(marker)}
					/>
				))}
			</MapView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		width: "100%",
		height: "100%",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: "#666",
		fontWeight: "500",
	},
	errorBanner: {
		position: "absolute",
		top: 40,
		left: 16,
		right: 16,
		backgroundColor: "#fff3cd",
		padding: 12,
		borderRadius: 8,
		zIndex: 1000,
		borderWidth: 1,
		borderColor: "#ffc107",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	errorText: {
		color: "#856404",
		fontSize: 14,
		fontWeight: "500",
		textAlign: "center",
	},
});
