import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";
import { router } from "expo-router";
import React, { useState } from "react";
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

	const handleNext = () => {
		if (isTransitioning) {
			return; // prevent multiple clicks
		}

		if (isLastSlide) {
			router.replace("/(auth)/sign-in");
			return;
		}

		setIsTransitioning(true);
		const nextIndex = activeIndex + 1;

		if (nextIndex < onboarding.length) {
			const scrollX = nextIndex * containerWidth;
			// Update index immediately for UI feedback
			setActiveIndex(nextIndex);

			// Scroll to the next slide with error handling
			try {
				if (scrollViewRef.current) {
					scrollViewRef.current.scrollTo({
						x: scrollX,
						animated: true,
					});
				}
			} catch {
				// no-op
			}
		}

		// Unlock after animation completes
		setTimeout(() => {
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
						// Only update if it's different to avoid loops
						if (index !== activeIndex) {
							setActiveIndex(index);
						}
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
							className={`w-[32px] h-[4px] mx-1 mb-2 rounded-md ${
								index === activeIndex ? "bg-[#0286FF]" : "bg-[#E2E8F0]"
							}`}
						/>
					))}
				</View>
			</View>

			{/* Next / Get Started Button */}
			<CustomButton
				title={isLastSlide ? "Get Started" : "Next"}
				onPress={handleNext}
				disabled={isTransitioning}
				className="w-11/12"
				bgVariant="default"
			/>

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
