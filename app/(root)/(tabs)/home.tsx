import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import MapComponent from "@/components/MapComponent";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["40%", "85%"], []);
	const insets = useSafeAreaInsets();

	const [destination, setDestination] = useState<Destination | null>(null);

	return (
		<View style={{ flex: 1 }}>
			<MapComponent radiusKm={2} />

			<View
				style={{
					position: "absolute",
					top: insets.top + 12,
					left: 12,
					right: 12,
				}}
			>
				<DestSearchBar onPlaceSelected={setDestination} />
			</View>

			<BottomSheet
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				enablePanDownToClose={false}
			>
				<BottomSheetView className="flex-1 p-5">
					<Text className="font-bold text-xl mb-3">Drivers Nearby</Text>
					<Text className="text-gray-500">
						Active drivers are shown on the map in real time.
					</Text>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
}
