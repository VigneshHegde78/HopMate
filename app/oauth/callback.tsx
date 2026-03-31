import { Image, View } from "react-native";

export default function OAuthCallback() {
	return (
		<View className="flex-1 items-center justify-center">
			<Image source={{ uri: "../../assets/images/callback-loader.gif", height: 200, width: 200 }} />
		</View>
	);
}
