import { Image, Text, View } from "react-native";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { useState } from "react";
import StarRating from "./StarRating";

const RideCard = ({ ride }: { ride: Ride }) => {
	const [userRating, setUserRating] = useState<number>(ride.rating ?? 0);

	const handleRatingChange = (value: number) => {
		setUserRating(value);
	};

	return (
		<View className="flex flex-row items-center justify-center rounded-md bg-white mb-1 shadow-sm shadow-neutral-300">
			<View className="flex flex-col items-start justify-center p-3">
				<View className="flex flex-row items-center justify-between">
					<Image
						source={{
							uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
						}}
						style={{ width: 80, height: 90, borderRadius: 8 }}
						className="w-[80px] h-[90px] rounded-lg"
					/>

					<View className="flex flex-col mx-5 gap-y-5 flex-1">
						<View className="flex flex-row items-center gap-x-2">
							<Image
								source={icons.to}
								style={{
									width: 20,
									height: 20,
									marginLeft: 10,
									marginRight: 5,
								}}
							/>
							<Text className="text-md font-figtreeMedium" numberOfLines={1}>
								{ride.origin_address}
							</Text>
						</View>

						<View className="flex flex-row items-center gap-x-2">
							<Image
								source={icons.point}
								style={{
									width: 20,
									height: 20,
									marginLeft: 10,
									marginRight: 5,
								}}
							/>
							<Text className="text-md font-figtreeMedium" numberOfLines={1}>
								{ride.destination_address}
							</Text>
						</View>
					</View>
				</View>

				<View className="flex flex-col w-full mt-5 rounded-md bg-gray-100 p-3 items-start justify-center ">
					<View className="flex flex-row items-center w-full justify-between mb-5">
						<Text className="text-md font-figtreeMedium text-gray-500">
							Date & Time
						</Text>
						<Text className="text-md font-JakartaBold" numberOfLines={1}>
							{formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
						</Text>
					</View>

					<View className="flex flex-row items-center w-full justify-between mb-4">
						<Text className="text-md font-figtreeMedium text-gray-500">
							Payment Status
						</Text>
						<Text
							className={`text-md capitalize font-JakartaBold ${ride.payment_status === "paid" ? "text-[rgb(0,255,51)]" : "text-red-500"}`}
						>
							{ride.payment_status}
						</Text>
					</View>

					<View className="flex flex-row items-center w-full justify-between">
						<Text className="text-md font-figtreeMedium text-gray-500">
							Rate
						</Text>
						<StarRating initial={userRating} onRate={handleRatingChange} />
					</View>
				</View>
			</View>
		</View>
	);
};

export default RideCard;
