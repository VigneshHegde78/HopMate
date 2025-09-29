// app/terms.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Terms() {
	const router = useRouter();

	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Header */}
			<View className="flex-row items-center p-4 border-b border-neutral-200">
				<TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
					<Ionicons name="arrow-back" size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-blue-600">
					Terms & Conditions
				</Text>
			</View>

			{/* Scrollable content */}
			<ScrollView className="p-4">
				<Text className="mb-4 text-base text-gray-700">
					Please read these Terms & Conditions carefully before using our app.
					By accessing or using the application, you agree to be bound by these
					terms.
				</Text>

				<Text className="text-lg font-bold text-black mb-2">
					1. Use of Service
				</Text>
				<Text className="mb-4 text-base text-gray-700">
					You agree to use the app only for lawful purposes and in compliance
					with all applicable laws and regulations.
				</Text>

				<Text className="text-lg font-bold text-black mb-2">2. Accounts</Text>
				<Text className="mb-4 text-base text-gray-700">
					When you create an account with us, you must provide accurate and
					complete information. You are responsible for safeguarding your
					account.
				</Text>

				<Text className="text-lg font-bold text-black mb-2">
					3. Intellectual Property
				</Text>
				<Text className="mb-4 text-base text-gray-700">
					All content, design, and code within the app are the property of the
					company and protected by copyright laws.
				</Text>

				<Text className="text-lg font-bold text-black mb-2">
					4. Changes to Terms
				</Text>
				<Text className="mb-4 text-base text-gray-700">
					We may update these terms at any time. Continued use of the app after
					changes means you accept the updated terms.
				</Text>

				<Text className="text-base text-gray-700 mb-6">
					If you have any questions, please contact us at support@example.com.
				</Text>
			</ScrollView>
		</SafeAreaView>
	);
}
