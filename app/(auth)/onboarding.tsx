import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Dimensions,
	Image,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const { width: screenWidth } = Dimensions.get("window");

export default function Onboarding() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [containerWidth, setContainerWidth] = useState(screenWidth);
	const isLastSlide = activeIndex === onboarding.length - 1;
	const scrollViewRef = React.useRef<ScrollView>(null);

	useEffect(() => {
		console.log(
			"ActiveIndex changed to:",
			activeIndex,
			"IsLastSlide:",
			isLastSlide
		);
		console.log(
			"Container width:",
			containerWidth,
			"Screen width:",
			screenWidth
		);
	}, [activeIndex, isLastSlide, containerWidth]);

	const handleNext = () => {
		console.log(
			"HandleNext called - Current index:",
			activeIndex,
			"IsTransitioning:",
			isTransitioning
		);

		if (isTransitioning) {
			console.log("Blocked due to transition");
			return; // prevent multiple clicks
		}

		if (isLastSlide) {
			console.log("Last slide, navigating to sign-in");
			router.replace("/(auth)/sign-in");
			return;
		}

		setIsTransitioning(true);
		const nextIndex = activeIndex + 1;
		console.log(
			"Moving to next index:",
			nextIndex,
			"Total slides:",
			onboarding.length
		);

		if (nextIndex < onboarding.length) {
			const scrollX = nextIndex * containerWidth;
			console.log("Scrolling to position:", scrollX, "Width:", containerWidth);

			// Update index immediately for UI feedback
			setActiveIndex(nextIndex);

			// Scroll to the next slide with error handling
			try {
				if (scrollViewRef.current) {
					scrollViewRef.current.scrollTo({
						x: scrollX,
						animated: true,
					});
					console.log("ScrollTo executed successfully");
				} else {
					console.log("ScrollViewRef is null");
				}
			} catch (error) {
				console.log("ScrollTo error:", error);
			}
		}

		// Unlock after animation completes
		setTimeout(() => {
			console.log("Transition unlocked");
			setIsTransitioning(false);
		}, 500); // Increased timeout slightly
	};

	return (
		<SafeAreaView className="flex h-full items-center justify-between bg-white">
			{/* Skip Button */}
			<View className="w-full flex-row justify-end p-5">
				<TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
					<Text className="text-black text-md font-figtreeBold underline">
						Skip
					</Text>
				</TouchableOpacity>
			</View>

			{/* Custom Slider */}
			<View
				className="flex-1"
				onLayout={(event) => {
					const { width } = event.nativeEvent.layout;
					console.log("Container layout width:", width);
					setContainerWidth(width);
				}}
			>
				<ScrollView
					ref={scrollViewRef}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={(event) => {
						const scrollX = event.nativeEvent.contentOffset.x;
						const index = Math.round(scrollX / containerWidth);
						console.log(
							"Scroll ended - ScrollX:",
							scrollX,
							"Calculated index:",
							index
						);

						// Only update if it's different to avoid loops
						if (index !== activeIndex) {
							setActiveIndex(index);
						}
					}}
					onScrollEndDrag={(event) => {
						const scrollX = event.nativeEvent.contentOffset.x;
						const index = Math.round(scrollX / containerWidth);
						console.log(
							"Scroll drag ended - ScrollX:",
							scrollX,
							"Calculated index:",
							index
						);
					}}
					scrollEventThrottle={16}
					bounces={false}
					decelerationRate="fast"
				>
					{onboarding.map((item, index) => (
						<View
							key={`onboarding-${item.id}`}
							style={{ width: containerWidth }}
							className="flex items-center justify-center p-5"
						>
							<Image
								source={item.image}
								className="w-full h-[300px]"
								resizeMode="contain"
							/>
							<View className="flex flex-row items-center justify-center mt-10 w-full">
								<Text className="text-black text-3xl font-figtreeExtraBold mx-10 text-center">
									{item.title}
								</Text>
							</View>
							<Text className="text-[#858585] text-lg font-lexendSemiBold mt-3 text-center mx-10">
								{item.description}
							</Text>
						</View>
					))}
				</ScrollView>

				{/* Pagination Dots */}
				<View className="flex-row justify-center items-center mt-8">
					{onboarding.map((_, index) => (
						<View
							key={index}
							className={`w-[32px] h-[4px] mx-1 rounded-md ${
								index === activeIndex ? "bg-[#0286FF]" : "bg-[#E2E8F0]"
							}`}
						/>
					))}
				</View>
			</View>

			{/* Debug Info */}
			<View className="mb-2">
				<Text className="text-center text-sm text-gray-500">
					Debug: Index {activeIndex + 1}/{onboarding.length} | Width:{" "}
					{containerWidth}px | Transitioning: {isTransitioning.toString()}
				</Text>
			</View>

			{/* Next / Get Started Button */}
			<CustomButton
				title={isLastSlide ? "Get Started" : "Next"}
				onPress={handleNext}
				disabled={isTransitioning}
				className="w-11/12"
				bgVariant="default"
			/>

			{/* Test Direct Scroll Button */}
			{!isLastSlide && (
				<TouchableOpacity
					onPress={() => {
						const nextIdx = activeIndex + 1;
						console.log("Direct test scroll to index:", nextIdx);
						scrollViewRef.current?.scrollTo({
							x: nextIdx * containerWidth,
							animated: true,
						});
						setActiveIndex(nextIdx);
					}}
					className="mt-2 p-2 bg-gray-200 rounded"
				>
					<Text className="text-center text-sm">Test Direct Scroll</Text>
				</TouchableOpacity>
			)}

			{/* Terms */}
			<View>
				<Text className="text-[#858585] text-sm font-lexendSemiBold text-center m-2">
					By continuing, you agree to our{" "}
					<Text
						className="text-[#0286FF] font-lexendSemiBold"
						onPress={() => router.push("/(auth)/terms")}
					>
						Terms of Service
					</Text>{" "}
					and{" "}
					<Text
						className="text-[#0286FF] font-lexendSemiBold"
						onPress={() => router.push("/(auth)/privacy")}
					>
						Privacy Policy
					</Text>
					.
				</Text>
			</View>
		</SafeAreaView>
	);
}
