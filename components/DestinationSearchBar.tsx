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

export type Destination = {
	latitude: number;
	longitude: number;
	name?: string;
	address?: string;
};

function DestinationSearchBar({
	onPlaceSelected,
	placeholder = "Search destination",
	minLength = 2,
}: {
	onPlaceSelected: (d: Destination) => void;
	placeholder?: string;
	minLength?: number;
}) {
	const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY || undefined;
	const [query, setQuery] = useState("");
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [loading, setLoading] = useState(false);
	const [detailsLoading, setDetailsLoading] = useState(false);
	const [statusMsg, setStatusMsg] = useState<string | null>(null);

	// Debug: log API key status once
	useEffect(() => {
		if (!apiKey) {
			console.warn(
				"⚠️ GEOAPIFY_API_KEY is undefined. Set EXPO_PUBLIC_GEOAPIFY_API_KEY in your .env file."
			);
		} else {
			console.log(
				"✓ Geoapify API key loaded:",
				apiKey.substring(0, 10) + "..."
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

		const controller = new AbortController();
		const timeout = setTimeout(async () => {
			try {
				setLoading(true);
				setStatusMsg(null);
				const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
				url.searchParams.set("input", query);
				url.searchParams.set("key", apiKey);
				url.searchParams.set("language", "en");
				url.searchParams.set("limit", "5");

				const res = await fetch(url.toString(), { signal: controller.signal });
				const data = await res.json();
				if (data.results && Array.isArray(data.results)) {
					const geoapifyResults = data.results.map((r: any) => ({
						place_id: r.place_id,
						description: r.formatted,
						structured_formatting: {
							main_text: r.address_line1 || r.name || r.formatted,
							secondary_text: r.address_line2 || r.country || "",
						},
					})) as Prediction[];
					setPredictions(geoapifyResults);
					setStatusMsg(null);
				} else {
					console.warn("Geoapify Autocomplete error:", data.error || data);
					setPredictions([]);
					setStatusMsg(data.error || "No results");
				}
			} catch (e) {
				console.warn("Geoapify Autocomplete error", e);
				setStatusMsg("Network error");
			} finally {
				setLoading(false);
			}
		}, 300);
		return () => {
			controller.abort();
			clearTimeout(timeout);
		};
	}, [apiKey, minLength, query]);

	const onSelectPrediction = async (p: Prediction) => {
		if (!apiKey) return;
		setDetailsLoading(true);
		try {
			const url = new URL("https://api.geoapify.com/v1/geocode/search");
			url.searchParams.set("text", p.description);
			url.searchParams.set("key", apiKey);
			url.searchParams.set("limit", "1");
			const res = await fetch(url.toString());
			const data = await res.json();
			if (data.results && data.results.length > 0) {
				const result = data.results[0];
				onPlaceSelected({
					latitude: result.lat,
					longitude: result.lon,
					name: result.name || result.address_line1,
					address: result.formatted,
				});
				setQuery(p.description);
				setPredictions([]);
			} else {
				console.warn("Geoapify Geocode error:", data.error || data);
				setStatusMsg(data.error || null);
			}
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
		<View style={{ width: "100%" }}>
			<View
				style={{
					backgroundColor: "#fff",
					borderRadius: 12,
					paddingHorizontal: 12,
					paddingVertical: 10,
					shadowColor: "#000",
					shadowOpacity: 0.1,
					shadowRadius: 10,
					elevation: 4,
				}}
			>
				<TextInput
					value={query}
					onChangeText={setQuery}
					placeholder={apiKey ? placeholder : "Add Geoapify API key"}
					placeholderTextColor="#999"
					style={{ fontSize: 16 }}
					autoCorrect={false}
					autoCapitalize="none"
					returnKeyType="search"
				/>
			</View>
			{loading && (
				<View style={{ paddingVertical: 8 }}>
					<ActivityIndicator size="small" />
				</View>
			)}
			{!loading && predictions.length > 0 && (
				<View
					style={{
						backgroundColor: "#fff",
						borderRadius: 12,
						marginTop: 8,
						overflow: "hidden",
						elevation: 2,
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
				query.trim().length >= minLength && (
					<View style={{ paddingVertical: 8 }}>
						<Text style={{ color: "#666" }}>{statusMsg || "No results"}</Text>
					</View>
				)}
			{detailsLoading && (
				<View style={{ paddingVertical: 8 }}>
					<ActivityIndicator size="small" />
				</View>
			)}
		</View>
	);
}

export default DestinationSearchBar;
