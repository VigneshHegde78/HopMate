import React, { useState } from "react";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const data = [
	{ label: "Male", value: "Male" },
	{ label: "Female", value: "Female" },
	{ label: "Other", value: "Other" },
];

interface DropdownComponentProps {
	selectedValue: string; // Prop for the selected value
	onValueChange: (value: string) => void; // Callback for value change
}

const DropdownComponent: React.FC<DropdownComponentProps> = ({
	selectedValue,
	onValueChange,
}) => {
	const [isFocus, setIsFocus] = useState(false);

	return (
		<View className="bg-white w-full">
			<Dropdown
				style={{
					height: 50,
					borderWidth: 0.5,
					borderRadius: 8,
					paddingHorizontal: 8,
					borderColor: isFocus ? "blue" : "gray",
				}}
				placeholderStyle={{ fontSize: 16 }}
				selectedTextStyle={{ fontSize: 16 }}
				iconStyle={{ width: 20, height: 20 }}
				data={data}
				maxHeight={300}
				labelField="label"
				valueField="value"
				placeholder={!isFocus ? "Select item" : "..."}
				value={selectedValue} // Use the selectedValue prop
				onFocus={() => setIsFocus(true)}
				onBlur={() => setIsFocus(false)}
				onChange={(item) => {
					onValueChange(item.value); // Call the onValueChange callback
					setIsFocus(false);
				}}
			/>
		</View>
	);
};

export default DropdownComponent;
