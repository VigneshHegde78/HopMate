import React from "react";
import { TextInput, View } from "react-native";

export default function ProfileFormInput({
	placeholder,
	defaultValue,
}: {
	placeholder: string;
	defaultValue: string;
}) {
	return (
		<View>
			<TextInput
				placeholder={placeholder}
				keyboardType={placeholder === "Phone Number" ? "number-pad" : "default"}
				defaultValue={defaultValue}
				
				className={`border border-neutral-400 text-wrap rounded-lg px-3`}
			></TextInput>
		</View>
	);
}
