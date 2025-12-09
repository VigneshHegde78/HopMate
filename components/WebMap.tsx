// components/WebMap.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const html = `
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>html,body,#map{height:100%;margin:0;padding:0}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([20.5937,78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
  </script>
</body>
</html>
`;

export default function WebMap() {
	return (
		<View style={styles.container}>
			<WebView originWhitelist={["*"]} source={{ html }} style={{ flex: 1 }} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
