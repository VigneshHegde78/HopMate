import React from "react";
import { TextInput, TextInputProps, View } from "react-native";

interface ProfileFormInputProps extends TextInputProps {
    placeholder: string;
    defaultValue: string;
    onChangeText: (text: string) => void; // Add onChangeText to the props
}

export default function ProfileFormInput({
    placeholder,
    defaultValue,
    onChangeText, // Destructure onChangeText
    ...props // Spread other props to allow flexibility
}: ProfileFormInputProps) {
    return (
        <View>
            <TextInput
                placeholder={placeholder}
                keyboardType={placeholder === "Phone Number" ? "number-pad" : "default"}
                defaultValue={defaultValue}
                onChangeText={onChangeText} // Pass onChangeText to TextInput
                className={`border border-neutral-400 text-wrap rounded-lg px-3`}
                {...props} // Spread other props to TextInput
            />
        </View>
    );
}