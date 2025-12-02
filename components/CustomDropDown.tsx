import React, { useState } from "react";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const data = [
	{ label: "Male", value: "1" },
	{ label: "Female", value: "2" },
	{ label: "Other", value: "3" },
];

const DropdownComponent = ({ gender }: { gender: string }) => {
	const [value, setValue] = useState(null);
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
				placeholder={!isFocus ? "Select" : "..."}
				value={gender}
				onFocus={() => setIsFocus(true)}
				onBlur={() => setIsFocus(false)}
				onChange={(item) => {
					setValue(item.value);
					setIsFocus(false);
				}}
			/>
		</View>
	);
};

export default DropdownComponent;
