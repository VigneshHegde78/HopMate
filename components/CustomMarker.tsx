import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";

interface CustomMarkerProps {
	coordinate: {
		latitude: number;
		longitude: number;
	};
	title?: string;
	description?: string;
	color?: string;
	icon?: string;
	onPress?: () => void;
}

/**
 * CustomMarker component for displaying markers with custom styling
 * This provides more control over marker appearance compared to default pins
 */
export default function CustomMarker({
	coordinate,
	title,
	description,
	color = "#ff6b6b",
	icon,
	onPress,
}: CustomMarkerProps) {
	return (
		<Marker
			coordinate={coordinate}
			title={title}
			description={description}
			onPress={onPress}
		>
			<View style={[styles.markerContainer, { backgroundColor: color }]}>
				{icon && <Text style={styles.icon}>{icon}</Text>}
				<View style={styles.markerArrow} />
			</View>
		</Marker>
	);
}

const styles = StyleSheet.create({
	markerContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "white",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	icon: {
		fontSize: 20,
		color: "white",
	},
	markerArrow: {
		position: "absolute",
		bottom: -8,
		width: 0,
		height: 0,
		borderLeftWidth: 8,
		borderRightWidth: 8,
		borderTopWidth: 8,
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderTopColor: "white",
	},
});
