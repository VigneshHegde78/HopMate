import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

const fallbackRegion: Region = {
  latitude: 19.3036,
  longitude: 72.8602,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapComponent() {
  const mapRef = useRef<MapView>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setInitialRegion(fallbackRegion);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: fallbackRegion.latitudeDelta,
          longitudeDelta: fallbackRegion.longitudeDelta,
        });
      } catch {
        setInitialRegion(fallbackRegion);
      }
    })();
  }, []);

  if (!initialRegion) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={[
          {
            elementType: "showsMyLocationButton",
            stylers: [{ visibility: "off" }],
          },
        ]}
        mapType="standard"
        showsUserLocation
        rotateEnabled={false}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        showsCompass
        showsScale
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        userInterfaceStyle="light"
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: initialRegion.latitude,
            longitude: initialRegion.longitude,
          }}
          title="My Location"
          description="This is a marker"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
