import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Text, View } from "react-native";
import CustomButton from "./CustomButton";

const CustomBottomSheet = () => {
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);

	// KEY FIX: Snap points are required
	const snapPoints = useMemo(() => ["25%", "50%"], []);

	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);

	const handleSheetChanges = useCallback((index: number) => {
		console.log("handleSheetChanges", index);
	}, []);

	// Optional: Adds a dark background when sheet is open
	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
			/>
		),
		[]
	);

	return (
		<View className="absolute bottom-10 w-full px-4">
			{/* Button floating above the map */}
			<CustomButton onPress={handlePresentModalPress} title="Present Modal" />

			<BottomSheetModal
				ref={bottomSheetModalRef}
				index={1}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				backdropComponent={renderBackdrop}
			>
				<BottomSheetView className="flex-1 p-5 items-center">
					<Text className="text-lg font-bold">Awesome 🎉</Text>
					<Text>You are viewing the bottom sheet!</Text>
				</BottomSheetView>
			</BottomSheetModal>
		</View>
	);
};

export default CustomBottomSheet;
