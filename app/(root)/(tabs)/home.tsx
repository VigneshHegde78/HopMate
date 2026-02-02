import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import MapComponent, { MapController } from "@/components/MapComponent";
import AppwriteClientInstance, { databases } from "@/lib/appwrite";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Query } from "appwrite";

export default function Home() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapController>(null);
  const snapPoints = useMemo(() => ["40%", "85%"], []);
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(2);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  // ================= DISTANCE (HAVERSINE) =================
  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ================= USER LOCATION (DYNAMIC) =================
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 25,
        },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();
  }, []);

  // ================= FETCH NEAREST DRIVER ONE BY ONE =================
  useEffect(() => {
    if (!userLocation) return;

    const fetchNearestDriver = async () => {
      const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID as string;
      const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_DRIVER_COLLECTION_ID || "location";

      let offset = 0;
      let nearestDriver: any = null;
      let nearestDistance = Infinity;

      while (true) {
        try {
          const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(1),
            Query.offset(offset),
          ]);

          if (res.documents.length === 0) break; // done

          const driver = res.documents[0];
          const lat = parseFloat(driver.CurruntLatitude ?? driver.DriverLatitude);
          const lng = parseFloat(driver.CurruntLongitude ?? driver.DriverLongitude);

          if (isNaN(lat) || isNaN(lng)) {
            offset++;
            continue; // skip invalid
          }

          const distance = getDistanceInKm(userLocation.latitude, userLocation.longitude, lat, lng);

          if (distance >= 0.5 && distance <= 2) {
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestDriver = {
                id: driver.UserId,
                title: `${driver.first_name ?? "Driver"} ${driver.last_name ?? ""}`.trim(),
                latitude: lat,
                longitude: lng,
                distance,
              };
            }
          }

          offset++;
        } catch (err) {
          console.error("Error fetching driver:", err);
          break;
        }
      }

      if (nearestDriver) {
        setSelectedDriver(nearestDriver);
        mapRef.current?.animateTo({
          latitude: nearestDriver.latitude,
          longitude: nearestDriver.longitude,
        });
      } else {
        setSelectedDriver(null);
        console.log("No drivers found in 0.5–2 km range");
      }
    };

    fetchNearestDriver();
  }, [userLocation]);

  // ================= UI =================
  return (
    <View style={{ flex: 1 }}>
      <MapComponent
        ref={mapRef}
        destination={
          destination
            ? { latitude: destination.latitude, longitude: destination.longitude, title: destination.name }
            : undefined
        }
        radiusKm={radiusKm}
      />

      <View style={{ position: "absolute", top: insets.top + 12, left: 12, right: 12 }}>
        <DestSearchBar
          onPlaceSelected={(d) => {
            setDestination(d);
            mapRef.current?.animateTo({ latitude: d.latitude, longitude: d.longitude });
          }}
        />
      </View>

      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={snapPoints} enablePanDownToClose={false}>
        <BottomSheetView className="flex-1 p-5">
          <Text className="font-bold text-xl mb-3">Nearest Driver</Text>

          {selectedDriver ? (
            <View className="bg-white p-4 rounded-lg">
              <Text className="font-bold text-lg">{selectedDriver.title}</Text>
              <Text>ID: {selectedDriver.id}</Text>
              <Text className="text-green-700">{selectedDriver.distance.toFixed(2)} km away</Text>
            </View>
          ) : (
            <Text className="text-gray-500">No drivers between 0.5–2 km</Text>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
