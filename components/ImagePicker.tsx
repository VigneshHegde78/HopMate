import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
	Image,
	Modal,
	Pressable,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ImagePickerComponent() {
	const [image, setImage] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);

	const openGallery = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
		if (!result.canceled) setImage(result.assets[0].uri);
		setModalVisible(false);
	};

	const openCamera = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (!permissionResult.granted) {
			alert("Camera permission required!");
			return;
		}
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
		if (!result.canceled) setImage(result.assets[0].uri);
		setModalVisible(false);
	};

	return (
		<View className="flex-1 items-center justify-center">
			{image && (
				<Image
					source={{ uri: image }}
					className="w-[120px] h-[120px] rounded-full absolute bottom-0 border-2 border-black"
				/>
			)}

			<TouchableOpacity onPress={() => setModalVisible(true)}>
				<View className="border rounded-full p-2 bg-gray-100 absolute bottom-0 left-5">
					<MaterialIcons name="camera-alt" size={20} color="black" />
				</View>
			</TouchableOpacity>

			{/* Centered Modal without animation */}
			<Modal transparent={true} visible={modalVisible}>
				<View className="flex-1 bg-black/50 justify-center items-center">
					<View className="w-10/12 bg-white rounded-xl p-5 items-start shadow-md">
						<Text className="text-lg font-extrabold mb-3">
							Select Image Source
						</Text>

						<Pressable onPress={openCamera} className="py-2">
							<Text className="text-base">Take a Photo</Text>
						</Pressable>

						<Pressable onPress={openGallery} className="py-2">
							<Text className="text-base">Choose from Gallery</Text>
						</Pressable>

						<Pressable onPress={() => setModalVisible(false)} className="mt-2">
							<Text className="text-base text-red-500">Cancel</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</View>
	);
}
