import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Image, Linking, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "./CustomButton";

export default function LocationGate({
	children,
}: {
	children: React.ReactNode;
}) {
	const [status, setStatus] = useState<string | null>(null);

	const requestPermission = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		setStatus(status);
	};

	useEffect(() => {
		requestPermission();
	}, []);

	if (status === null) {
		return (
			<View className="m-5">
				<Text className="text-md text-gray-500 font-lexendMedium">
					Checking location permission...
				</Text>
			</View>
		);
	}

	if (status !== "granted") {
		return (
			<SafeAreaView className="flex justify-center items-center mx-5 mt-1">
				<Image
					source={require("../assets/images/no-location.png")}
					className="w-80 h-80 mt-10"
					resizeMode="contain"
				/>

				<Text className="font-lexendBold text-2xl mt-5">
					Enable Your Location
				</Text>
				<Text className="font-lexendSemiBold text-gray-800 text-center mb-5">
					HopMate needs location access to match rides and drivers.
				</Text>

				<CustomButton
					title="Enable Location"
					onPress={requestPermission}
					bgVariant="outline"
					textVariant="warning"
					className="w-full"
				/>

				<CustomButton
					title="Open Settings"
					onPress={() => Linking.openSettings()}
					bgVariant="outline"
					textVariant="warning"
					className="w-full mt-2"
				/>
			</SafeAreaView>
		);
	}

	return children;
}
