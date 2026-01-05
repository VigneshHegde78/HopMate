import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const History = () => {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-1 justify-center items-center p-5">
				<Text className="text-2xl font-figtreeBold text-gray-800 mb-4">
					Ride History
				</Text>
				<Text className="text-base font-lexendRegular text-gray-600 text-center">
					View your past rides and driver trips here.
				</Text>
			</View>
		</SafeAreaView>
	);
};

export default History;
