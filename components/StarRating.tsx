import { MaterialIcons } from "@expo/vector-icons"; 
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

type StarRatingProps = {
	initial?: number;
	onRate?: (value: number) => void;
};

const StarRating: React.FC<StarRatingProps> = ({ initial = 0, onRate }) => {
	const [rating, setRating] = useState<number>(initial);

	const handleRate = (value: number) => {
		setRating(value);
		if (onRate) onRate(value);
	};

	return (
		<View style={{ flexDirection: "row" }}>
			{[...Array(5)].map((_, index) => {
				const value = index + 1;
				return (
					<TouchableOpacity key={value} onPress={() => handleRate(value)}>
						<MaterialIcons
							name={value <= rating ? "star" : "star-border"}
							size={28}
							color={value <= rating ? "#facc15" : "#d1d5db"}
						/>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default StarRating;
