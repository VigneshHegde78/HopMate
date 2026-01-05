import { Text, TouchableOpacity } from "react-native";
import { ButtonProps } from "../types/type";

const getBgVariantStyle = (bgvariant: ButtonProps["bgVariant"]) => {
	switch (bgvariant) {
		case "secondary":
			return "bg-gray-500";
		case "danger":
			return "bg-[#fbc02b]";
		case "success":
			return "bg-green-500";
		case "outline":
			return "bg-white";
		default:
			return "bg-[#0286FF]";
	}
};

const getTextVariantStyle = (txtvariant: ButtonProps["textVariant"]) => {
	switch (txtvariant) {
		case "primary":
			return "text-black";
		case "secondary":
			return "text-gray-100";
		case "danger":
			return "text-red-100";
		case "success":
			return "text-green-100";
		default:
			return "text-white";
	}
};

const CustomButton = ({
	onPress,
	title,
	bgVariant = "secondary",
	textVariant = "default",
	IconLeft,
	IconRight,
	className,
	...props
}: ButtonProps) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			className={`rounded-2xl p-3 flex flex-row justify-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(bgVariant)} ${className}`}
			{...props}
		>
			{IconLeft && <IconLeft />}
			<Text
				className={`text-center text-lg font-bold ${getTextVariantStyle(textVariant)} mx-3`}
			>
				{title}
			</Text>
			{IconRight && <IconRight />}
		</TouchableOpacity>
	);
};

export default CustomButton;
