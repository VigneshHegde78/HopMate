import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
	TextInput,
	TextInputProps,
	TouchableOpacity,
	View,
} from "react-native";

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

type InputFieldProps = TextInputProps & {
	iconName: MaterialIconName;
	isPassword?: boolean; // mark if this field is a password
};

export default function InputField({
	iconName,
	isPassword = false,
	...props
}: InputFieldProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	return (
		<View className="mb-4 flex-row items-center border rounded-2xl border-gray-400 p-2">
			<MaterialIcons
				name={iconName}
				size={20}
				style={{
					color: isFocused ? "#0286FF" : "#303030",
					marginRight: 8,
					marginLeft: 4,
				}}
			/>
			<TextInput
				className="flex-1 text-base text-gray-500 p-2"
				secureTextEntry={isPassword && !showPassword}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				{...props}
			/>
			{isPassword && (
				<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
					<MaterialIcons
						name={showPassword ? "visibility" : "visibility-off"}
						size={20}
						style={{ marginRight: 4, color: "#858585" }}
					/>
				</TouchableOpacity>
			)}
		</View>
	);
}
