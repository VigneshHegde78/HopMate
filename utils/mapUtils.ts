import { Region } from "react-native-maps";

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 6371e3; // Earth's radius in meters
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

/**
 * Format distance to human-readable string
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "120 m" or "1.2 km")
 */
export function formatDistance(meters: number): string {
	if (meters < 1000) {
		return `${Math.round(meters)} m`;
	}
	return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Get region that includes all markers
 * @param markers Array of coordinates
 * @returns Region that fits all markers
 */
export function getRegionForCoordinates(
	markers: { latitude: number; longitude: number }[]
): Region | null {
	if (markers.length === 0) return null;

	let minLat = markers[0].latitude;
	let maxLat = markers[0].latitude;
	let minLon = markers[0].longitude;
	let maxLon = markers[0].longitude;

	markers.forEach((marker) => {
		minLat = Math.min(minLat, marker.latitude);
		maxLat = Math.max(maxLat, marker.latitude);
		minLon = Math.min(minLon, marker.longitude);
		maxLon = Math.max(maxLon, marker.longitude);
	});

	const centerLat = (minLat + maxLat) / 2;
	const centerLon = (minLon + maxLon) / 2;
	const latDelta = (maxLat - minLat) * 1.2; // Add 20% padding
	const lonDelta = (maxLon - minLon) * 1.2; // Add 20% padding

	return {
		latitude: centerLat,
		longitude: centerLon,
		latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
		longitudeDelta: Math.max(lonDelta, 0.01), // Minimum zoom level
	};
}

/**
 * Check if a coordinate is within a region
 * @param coord Coordinate to check
 * @param region Region to check against
 * @returns True if coordinate is within region
 */
export function isCoordinateInRegion(
	coord: { latitude: number; longitude: number },
	region: Region
): boolean {
	const latMin = region.latitude - region.latitudeDelta / 2;
	const latMax = region.latitude + region.latitudeDelta / 2;
	const lonMin = region.longitude - region.longitudeDelta / 2;
	const lonMax = region.longitude + region.longitudeDelta / 2;

	return (
		coord.latitude >= latMin &&
		coord.latitude <= latMax &&
		coord.longitude >= lonMin &&
		coord.longitude <= lonMax
	);
}

/**
 * Generate random coordinates near a center point
 * Useful for testing and demo purposes
 * @param center Center coordinate
 * @param radiusInMeters Radius in meters
 * @param count Number of coordinates to generate
 * @returns Array of random coordinates
 */
export function generateRandomCoordinates(
	center: { latitude: number; longitude: number },
	radiusInMeters: number,
	count: number
): { latitude: number; longitude: number }[] {
	const coordinates: { latitude: number; longitude: number }[] = [];
	const radiusInDegrees = radiusInMeters / 111320; // Approximate conversion

	for (let i = 0; i < count; i++) {
		const angle = Math.random() * 2 * Math.PI;
		const radius = Math.random() * radiusInDegrees;

		const latitude = center.latitude + radius * Math.cos(angle);
		const longitude = center.longitude + radius * Math.sin(angle);

		coordinates.push({ latitude, longitude });
	}

	return coordinates;
}
