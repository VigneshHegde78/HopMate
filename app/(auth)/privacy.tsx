// app/terms.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Privacy() {
	const router = useRouter();

	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Header */}
			<View className="flex-row items-center p-4 border-b border-neutral-200">
				<TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
					<Ionicons name="arrow-back" size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-blue-600">Privacy Policy</Text>
			</View>

			{/* Scrollable content */}
			<ScrollView className="p-4">
				<Text className="text-base text-gray-700 mb-4">
					Your privacy is important to us. This policy explains how we collect,
					use, and protect your personal information.
				</Text>

				<View className="mb-4">
					<Text className="text-lg font-semibold mb-2">1. Data We Collect</Text>
					<Text className="text-gray-700">
						We collect your location, travel history, and account information to
						provide personalized travel experiences.
					</Text>
				</View>

				<View className="mb-4">
					<Text className="text-lg font-semibold mb-2">
						2. How We Use Your Data
					</Text>
					<Text className="text-gray-700">
						We use your data to optimize routes, suggest destinations, and
						improve app features. We do not sell your personal information.
					</Text>
				</View>

				<View className="mb-4">
					<Text className="text-lg font-semibold mb-2">3. Data Security</Text>
					<Text className="text-gray-700">
						We implement encryption and secure storage practices to protect your
						data from unauthorized access.
					</Text>
				</View>

				<Text className="text-gray-600 mt-6 mb-10">
					By using HopMate, you consent to the practices outlined in this
					policy.
				</Text>
			</ScrollView>
		</SafeAreaView>
	);
}
