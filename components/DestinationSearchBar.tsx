import { type Destination } from "@/types";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type Prediction = {
	description: string;
	place_id: string;
	structured_formatting?: {
		main_text?: string;
		secondary_text?: string;
	};
};

function DestinationSearchBar({
	onPlaceSelected,
	placeholder = "Search destination",
	minLength = 2,
	onReset,
}: {
	onPlaceSelected: (d: Destination) => void;
	placeholder?: string;
	minLength?: number;
	onReset?: () => void;
}) {
	const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY || undefined;
	const [query, setQuery] = useState("");
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [loading, setLoading] = useState(false);
	const [detailsLoading, setDetailsLoading] = useState(false);
	const [statusMsg, setStatusMsg] = useState<string | null>(null);
	const [justSelected, setJustSelected] = useState(false);

	useEffect(() => {
		if (!apiKey) {
			console.warn(
				"⚠️ GEOAPIFY_API_KEY is undefined. Set EXPO_PUBLIC_GEOAPIFY_API_KEY in your .env file.",
			);
		}
	}, [apiKey]);

	useEffect(() => {
		if (!apiKey) {
			setStatusMsg("Geoapify API key missing");
			return;
		}
		if (query.trim().length < minLength) {
			setPredictions([]);
			setStatusMsg(null);
			return;
		}

		// Skip fetching if we just selected a prediction
		if (justSelected) {
			setJustSelected(false);
			return;
		}

		const controller = new AbortController();
		const timeout = setTimeout(async () => {
			try {
				setLoading(true);
				setStatusMsg(null);
				const url = new URL(
					`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}`,
				);

				const res = await fetch(url.toString(), { signal: controller.signal });
				const data = await res.json();

				// FIX 1: Geoapify returns "features", not "results"
				if (data.features && Array.isArray(data.features)) {
					const geoapifyResults = data.features.map((feature: any) => {
						// FIX 2: Data is inside "properties"
						const props = feature.properties;
						return {
							place_id: props.place_id,
							description: props.formatted,
							structured_formatting: {
								main_text: props.address_line1 || props.name || props.formatted,
								secondary_text: props.address_line2 || props.country || "",
							},
						};
					}) as Prediction[];
					setPredictions(geoapifyResults);
					setStatusMsg(null);
				} else {
					console.warn("Geoapify Autocomplete error:", data);
					setPredictions([]);
					setStatusMsg("No results found");
				}
			} catch (e: any) {
				if (e.name !== "AbortError") {
					console.warn("Geoapify Autocomplete error", e);
					setStatusMsg("Network error");
				}
			} finally {
				setLoading(false);
			}
		}, 300);
		return () => {
			controller.abort();
			clearTimeout(timeout);
		};
	}, [apiKey, minLength, query, justSelected]);

	const onSelectPrediction = async (p: Prediction) => {
		if (!apiKey) return;
		setDetailsLoading(true);
		try {
			const url = new URL("https://api.geoapify.com/v1/geocode/search");
			url.searchParams.set("text", p.description);
			url.searchParams.set("apiKey", apiKey); // Note: param is usually 'apiKey', not 'key' for Geoapify, though some endpoints accept both
			url.searchParams.set("limit", "1");

			const res = await fetch(url.toString());
			const data = await res.json();

			// FIX 3: Parse "features" for the selection logic as well
			if (data.features && data.features.length > 0) {
				const result = data.features[0];
				const props = result.properties;

				const destination = {
					latitude: props.lat,
					longitude: props.lon,
					name: props.name || props.address_line1,
					address: props.formatted,
				};
				onPlaceSelected(destination);
				setQuery("");
				setPredictions([]);
				setJustSelected(true);
			} else {
				console.warn("Geoapify Geocode error:", data);
				setStatusMsg("Details not found");
			}
		} catch (e) {
			console.error(e);
		} finally {
			setDetailsLoading(false);
		}
	};

	const renderItem = ({ item }: { item: Prediction }) => (
		<TouchableOpacity
			onPress={() => onSelectPrediction(item)}
			style={{ paddingVertical: 10, paddingHorizontal: 12 }}
		>
			<Text style={{ fontSize: 16, fontWeight: "500" }}>
				{item.structured_formatting?.main_text || item.description}
			</Text>
			{item.structured_formatting?.secondary_text ? (
				<Text style={{ fontSize: 12, color: "#666" }}>
					{item.structured_formatting.secondary_text}
				</Text>
			) : null}
		</TouchableOpacity>
	);

	return (
		<View style={{ width: "100%", position: "relative", zIndex: 1000 }}>
			<View className="flex-row items-center border border-gray-500 gap-1 rounded-3xl bg-white px-4 py-2 mb-3">
				<MaterialIcons name="search" size={24} color="#666" />
				<TextInput
					value={query}
					onChangeText={(text) => {
						setQuery(text);
						setJustSelected(false);
					}}
					placeholder={apiKey ? placeholder : "Add Geoapify API key"}
					placeholderTextColor="#999"
					style={{ fontSize: 16, flex: 1, paddingVertical: 4 }}
					autoCorrect={false}
					autoCapitalize="none"
					returnKeyType="search"
				/>
				{query.length > 0 && (
					<MaterialIcons
						name="close"
						size={20}
						color="#666"
						onPress={() => setQuery("")}
					/>
				)}
			</View>
			{loading && (
				<View
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						right: 0,
						paddingVertical: 8,
						backgroundColor: "#fff",
						borderRadius: 12,
						marginTop: 8,
						zIndex: 1001,
					}}
				>
					<ActivityIndicator size="small" />
				</View>
			)}
			{!loading && predictions.length > 0 && (
				<View
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						right: 0,
						backgroundColor: "#fff",
						borderRadius: 12,
						marginTop: 8,
						overflow: "hidden",
						elevation: 2,
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.1,
						shadowRadius: 4,
						maxHeight: 300,
						zIndex: 1001,
					}}
				>
					<FlatList
						keyboardShouldPersistTaps="handled"
						data={predictions}
						renderItem={renderItem}
						keyExtractor={(i) => i.place_id}
						ItemSeparatorComponent={() => (
							<View style={{ height: 1, backgroundColor: "#eee" }} />
						)}
					/>
				</View>
			)}
			{!loading &&
				predictions.length === 0 &&
				query.trim().length >= minLength &&
				statusMsg && (
					<View
						style={{
							position: "absolute",
							top: "100%",
							left: 0,
							right: 0,
							paddingVertical: 8,
							backgroundColor: "#fff",
							borderRadius: 12,
							marginTop: 8,
							zIndex: 1001,
						}}
					>
						<Text style={{ color: "#666", textAlign: "center" }}>
							{statusMsg}
						</Text>
					</View>
				)}
			{detailsLoading && (
				<View
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						right: 0,
						paddingVertical: 8,
						backgroundColor: "#fff",
						borderRadius: 12,
						marginTop: 8,
						zIndex: 1001,
					}}
				>
					<ActivityIndicator size="small" />
				</View>
			)}
		</View>
	);
}

export default DestinationSearchBar;
export { Destination };
