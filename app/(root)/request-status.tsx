import { Text, View } from "react-native";

export default function RequestStatus() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				padding: 24,
			}}
		>
			<Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
				Request Sent 🚀
			</Text>

			<Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
				Waiting for driver response...
			</Text>
		</View>
	);
}
