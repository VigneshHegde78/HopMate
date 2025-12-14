import CustomBottomSheet from "@/components/CustomBottomSheet";
import Mapbox from "@rnmapbox/maps";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Mapbox.setAccessToken("<YOUR_ACCESSTOKEN>");

const Home = () => {
	return (
		// 1. GestureHandler must be at the root
		<GestureHandlerRootView className="flex-1">
			{/* 2. Provider wraps the screen content */}
			<BottomSheetModalProvider>
				<View className="flex-1 relative">
					{/* 3. Map needs flex-1 to fill the screen */}
					<Mapbox.MapView className="flex-1" />

					{/* 4. CustomBottomSheet sits "on top" visually because it is rendered last */}
					<CustomBottomSheet />
				</View>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
};

export default Home;
