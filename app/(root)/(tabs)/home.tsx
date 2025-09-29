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
				<Image
					source={{
						uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=400&height=600&center=lonlat:73.856744,18.520430&zoom=15&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
					}}
					className="w-full h-full"
					resizeMode="cover"
				/>
			</View>

			{/* Circle Radius + Pin + Nearby Users */}
			<View
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<View
					style={{
						width: RADIUS * 2,
						height: RADIUS * 2,
						borderRadius: RADIUS,
						backgroundColor: "rgba(2, 134, 255, 0.1)",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					{/* Center Pin */}
					<Image
						source={icons.pin}
						resizeMode="contain"
						style={{ height: 30, width: 30, tintColor: "#003f5c" }}
					/>

					{/* Nearby Users as Random Letters */}
					{nearbyPoints.map((point, index) => {
						const UserIcon = (
							<View
								style={{
									position: "absolute",
									left: RADIUS + point.x - 8,
									top: RADIUS + point.y - 8,
								}}
								className="bg-[#fbc02b96] w-7 h-7 rounded-full items-center justify-center"
							>
								<Text>
									{letters.charAt(Math.floor(Math.random() * letters.length))}
								</Text>
							</View>
						);
						return React.cloneElement(UserIcon, {
							key: `nearby-user-${index}`,
						});
					})}
				</View>
			</View>

			{/* Title */}
			<View className="flex-row items-end">
				<Text className="text-3xl font-lexendBold text-[#454545] pl-3">
					HopMate
				</Text>
			</View>
			{/* Search Bar */}
			<View className="mx-3 my-5 bg-white rounded-full shadow-sm shadow-neutral-300 px-5 py-1 flex-row items-center">
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
