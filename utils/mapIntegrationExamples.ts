/**
 * Map Integration Examples
 *
 * This file contains example code for common map operations
 * like fetching nearby rides, updating markers in real-time, etc.
 */

import { MapMarker } from "@/components/MapView";
import { calculateDistance, formatDistance } from "@/utils/mapUtils";
import React from "react";
import { Region } from "react-native-maps";

// ============================================
// Example 1: Fetch Nearby Rides from API
// ============================================

interface Ride {
	id: string;
	driver_name: string;
	location: {
		latitude: number;
		longitude: number;
	};
	available_seats: number;
	price: number;
}

export async function fetchNearbyRides(
	region: Region,
	radiusInMeters: number = 5000
): Promise<MapMarker[]> {
	try {
		// Replace with your actual API endpoint
		const response = await fetch(
			`https://your-api.com/rides/nearby?` +
				`lat=${region.latitude}&` +
				`lon=${region.longitude}&` +
				`radius=${radiusInMeters}`
		);

		const rides: Ride[] = await response.json();

		// Convert API response to map markers
		const markers: MapMarker[] = rides.map((ride) => ({
			id: ride.id,
			latitude: ride.location.latitude,
			longitude: ride.location.longitude,
			title: ride.driver_name,
			description: `${ride.available_seats} seats • $${ride.price}`,
			color: ride.available_seats > 2 ? "#4ecdc4" : "#ff6b6b",
		}));

		return markers;
	} catch (error) {
		console.error("Error fetching nearby rides:", error);
		return [];
	}
}

// ============================================
// Example 2: Filter Markers by Distance
// ============================================

export function filterMarkersByDistance(
	markers: MapMarker[],
	userLocation: { latitude: number; longitude: number },
	maxDistanceMeters: number
): MapMarker[] {
	return markers.filter((marker) => {
		const distance = calculateDistance(
			userLocation.latitude,
			userLocation.longitude,
			marker.latitude,
			marker.longitude
		);
		return distance <= maxDistanceMeters;
	});
}

// ============================================
// Example 3: Sort Markers by Distance
// ============================================

export function sortMarkersByDistance(
	markers: MapMarker[],
	userLocation: { latitude: number; longitude: number }
): (MapMarker & { distance: number; formattedDistance: string })[] {
	return markers
		.map((marker) => {
			const distance = calculateDistance(
				userLocation.latitude,
				userLocation.longitude,
				marker.latitude,
				marker.longitude
			);
			return {
				...marker,
				distance,
				formattedDistance: formatDistance(distance),
			};
		})
		.sort((a, b) => a.distance - b.distance);
}

// ============================================
// Example 4: Real-time Marker Updates
// ============================================

export class RideLocationTracker {
	private markers: Map<string, MapMarker> = new Map();
	private listeners: ((markers: MapMarker[]) => void)[] = [];

	// Add or update a marker
	updateMarker(marker: MapMarker) {
		this.markers.set(marker.id, marker);
		this.notifyListeners();
	}

	// Remove a marker
	removeMarker(markerId: string) {
		this.markers.delete(markerId);
		this.notifyListeners();
	}

	// Get all markers
	getMarkers(): MapMarker[] {
		return Array.from(this.markers.values());
	}

	// Subscribe to marker updates
	subscribe(listener: (markers: MapMarker[]) => void) {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	private notifyListeners() {
		const markers = this.getMarkers();
		this.listeners.forEach((listener) => listener(markers));
	}

	// Connect to WebSocket for real-time updates
	connectWebSocket(url: string) {
		const ws = new WebSocket(url);

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			switch (data.type) {
				case "ride_location_update":
					this.updateMarker({
						id: data.rideId,
						latitude: data.latitude,
						longitude: data.longitude,
						title: data.driverName,
						description: data.description,
						color: data.color,
					});
					break;

				case "ride_ended":
					this.removeMarker(data.rideId);
					break;
			}
		};

		return ws;
	}
}

// ============================================
// Example 5: Usage in React Component
// ============================================

/*
import React, { useEffect, useState } from "react";
import MapViewComponent, { MapMarker } from "@/components/MapView";
import { Region } from "react-native-maps";

export function RideMapScreen() {
	const [markers, setMarkers] = useState<MapMarker[]>([]);
	const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

	// Fetch rides when region changes
	useEffect(() => {
		if (!currentRegion) return;

		const fetchRides = async () => {
			const nearbyRides = await fetchNearbyRides(currentRegion);
			setMarkers(nearbyRides);
		};

		fetchRides();
	}, [currentRegion]);

	// Set up real-time updates
	useEffect(() => {
		const tracker = new RideLocationTracker();
		
		// Subscribe to marker updates
		const unsubscribe = tracker.subscribe((newMarkers) => {
			setMarkers(newMarkers);
		});

		// Connect to WebSocket
		const ws = tracker.connectWebSocket("wss://your-api.com/rides/live");

		// Cleanup
		return () => {
			unsubscribe();
			ws.close();
		};
	}, []);

	return (
		<MapViewComponent
			showUserLocation={true}
			markers={markers}
			onRegionChange={setCurrentRegion}
			onMarkerPress={(marker) => {
				// Navigate to ride details
				console.log("Selected ride:", marker);
			}}
		/>
	);
}
*/

// ============================================
// Example 6: Debounced Region Updates
// ============================================

export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

/*
Usage in component:

const [region, setRegion] = useState<Region | null>(null);
const debouncedRegion = useDebounce(region, 500); // 500ms delay

useEffect(() => {
	if (debouncedRegion) {
		// Only fetch rides after user stops moving map for 500ms
		fetchNearbyRides(debouncedRegion).then(setMarkers);
	}
}, [debouncedRegion]);
*/

// ============================================
// Example 7: Marker Clustering (Pseudo-code)
// ============================================

interface Cluster {
	id: string;
	latitude: number;
	longitude: number;
	pointCount: number;
	markers: MapMarker[];
}

export function clusterMarkers(
	markers: MapMarker[],
	region: Region,
	clusterRadius: number = 50
): (MapMarker | Cluster)[] {
	// This is a simplified example
	// For production, use a library like 'supercluster'

	const clusters: Map<string, MapMarker[]> = new Map();

	markers.forEach((marker) => {
		// Find nearby cluster or create new one
		let foundCluster = false;

		for (const [key, clusterMarkers] of clusters.entries()) {
			const [lat, lon] = key.split(",").map(Number);
			const distance = calculateDistance(
				lat,
				lon,
				marker.latitude,
				marker.longitude
			);

			if (distance < clusterRadius) {
				clusterMarkers.push(marker);
				foundCluster = true;
				break;
			}
		}

		if (!foundCluster) {
			const key = `${marker.latitude},${marker.longitude}`;
			clusters.set(key, [marker]);
		}
	});

	// Convert to cluster objects
	const result: (MapMarker | Cluster)[] = [];

	for (const [key, clusterMarkers] of clusters.entries()) {
		if (clusterMarkers.length === 1) {
			result.push(clusterMarkers[0]);
		} else {
			const [lat, lon] = key.split(",").map(Number);
			result.push({
				id: key,
				latitude: lat,
				longitude: lon,
				pointCount: clusterMarkers.length,
				markers: clusterMarkers,
			});
		}
	}

	return result;
}

export default {
	fetchNearbyRides,
	filterMarkersByDistance,
	sortMarkersByDistance,
	RideLocationTracker,
	useDebounce,
	clusterMarkers,
};
