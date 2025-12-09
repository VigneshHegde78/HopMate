import MapComponent from "@/components/MapComponent";
import WebMap from "@/components/WebMap";
import { icons } from "@/constants";
import { useUserMode } from "@/contexts/UserModeContext";
import React from "react";
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const RADIUS = 150; // radius of the circle

// Generate N random points inside a circle
const generateRandomPoints = (numPoints: number, radius: number) => {
	const points = [];
	for (let i = 0; i < numPoints; i++) {
		const angle = Math.random() * 2 * Math.PI;
		const r = radius * Math.sqrt(Math.random()); // uniform distribution
		const x = r * Math.cos(angle);
		const y = r * Math.sin(angle);
		points.push({ x, y });
	}
	return points;
};

export default function Home() {
	const { mode } = useUserMode();
	const nearbyPoints = generateRandomPoints(8, RADIUS); // 8 nearby users
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	const handlePlaceSelect = (place: any) => {
		console.log("Selected place:", place);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Map Image */}
			<View className="flex items-center justify-between w-full h-full absolute bg-white">
				<WebMap />
			</View>

			{/* Title */}
			<View className="flex-row items-end">
				<Text className="text-3xl font-lexendBold text-[#454545] pl-3 pt-3">
					HopMate
				</Text>
				<Text className="text-xs font-lexendBold text-[#454545] p-1 ml-0.5">
					{mode.toUpperCase()}
				</Text>
			</View>
			{/* Search Bar */}
			<View className="mx-3 my-2 bg-white rounded-2xl shadow-sm shadow-neutral-300 px-5 py-1 flex-row items-center">
				<Image
					source={icons.search}
					style={{ width: 20, height: 20, tintColor: "#858585" }}
					resizeMode="contain"
				/>
				<TextInput
					placeholder="Search for a place or address"
					placeholderTextColor={"#858585"}
					className="w-full ml-3 text-gray-500"
					style={{ height: 40 }}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
