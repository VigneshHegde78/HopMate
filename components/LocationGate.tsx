import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Button, Linking, Text, View } from "react-native";

export default function LocationGate({
	children,
}: {
	children: React.ReactNode;
}) {
	const [status, setStatus] = useState<string | null>(null);

	const requestPermission = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		setStatus(status);
	};

	useEffect(() => {
		requestPermission();
	}, []);

	if (status === null) {
		return <Text>Checking location permission...</Text>;
	}

	if (status !== "granted") {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text style={{ textAlign: "center", marginBottom: 20 }}>
					HopMate needs location access to match rides and drivers.
				</Text>

				<Button title="Enable Location" onPress={requestPermission} />

				<Button title="Open Settings" onPress={() => Linking.openSettings()} />
			</View>
		);
	}

	return children;
}
