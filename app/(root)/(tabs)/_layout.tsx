import { icons } from "@/constants";
import { useUserMode } from "@/contexts/UserModeContext";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";

const TabIcon = ({
	source,
	focused,
}: {
	source: ImageSourcePropType;
	focused: boolean;
}) => (
	<View
		className={`w-12 h-12 items-center justify-center rounded-full ${
			focused ? "bg-gray-50" : ""
		}`}
	>
		<Image
			source={source}
			tintColor={focused ? "#fbc02b" : "#003f5c"}
			resizeMode="contain"
			className="w-7 h-7"
		/>
	</View>
);

export default function RootLayout() {
	const { mode } = useUserMode();
	const isUserMode = mode === "user";

	return (
		<Tabs
			initialRouteName={isUserMode ? "home" : "driver"}
			screenOptions={{
				tabBarActiveTintColor: "white",
				tabBarInactiveTintColor: "white",
				tabBarShowLabel: false,
				tabBarItemStyle: {
					justifyContent: "center",
					alignItems: "center",
				},
				tabBarIconStyle: {
					marginTop: 10,
				},
				tabBarStyle: {
					backgroundColor: "#fff",
					borderRadius: 50,
					marginHorizontal: 20,
					marginBottom: 20,
					height: 58,
					position: "absolute",
					shadowColor: "#000",
					shadowOpacity: 0.15,
					shadowOffset: { width: 0, height: 4 },
					shadowRadius: 8,
					elevation: 5,
				},
			}}
		>
			{/* All possible screens - visibility controlled by href */}
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} source={icons.map} />
					),
					headerShown: false,
					href: isUserMode ? "/home" : null,
				}}
			/>
			<Tabs.Screen
				name="saved"
				options={{
					title: "Saved",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} source={icons.list} />
					),
					headerShown: false,
					href: isUserMode ? "/saved" : null,
				}}
			/>
			<Tabs.Screen
				name="rides"
				options={{
					title: "Rides",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} source={icons.rides} />
					),
					headerShown: false,
					href: isUserMode ? "/rides" : null,
				}}
			/>
			<Tabs.Screen
				name="driver"
				options={{
					title: "Driver",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} source={icons.home} />
					),
					headerShown: false,
					href: !isUserMode ? "/driver" : null,
				}}
			/>
			<Tabs.Screen
				name="history"
				options={{
					title: "History",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} source={icons.rides} />
					),
					headerShown: false,
					href: !isUserMode ? "/history" : null,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} source={icons.profile} />
					),
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}
