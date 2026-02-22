import type { Destination, DriverDoc } from "@/types";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useRef, useState } from "react";
import { Text } from "react-native";
import BrowseDriversView from "../app/(root)/browse-drivers";
import RequestRideView from "../app/(root)/request-ride";
import RequestStatusView from "../app/(root)/request-status";

type Props = {
	drivers: DriverDoc[];
	userLocation: { latitude: number; longitude: number } | null;
};

export default function CustomBottomSheet({ drivers, userLocation }: Props) {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["40%", "60%", "85%"], []);

	const [flowState, setFlowState] = useState<
		"BROWSE" | "REQUEST" | "WAITING" | "CONFIRMED"
	>("BROWSE");

	const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
	const [destination, setDestination] = useState<Destination | null>(null);
	const [requestId, setRequestId] = useState<string | null>(null);

	const resetFlow = () => {
		setFlowState("BROWSE");
		setSelectedDriver(null);
		setRequestId(null);
	};

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={1}
			snapPoints={snapPoints}
			enablePanDownToClose={false}
		>
			<BottomSheetView
				style={{
					flex: 1,
					height: "100%",
					padding: 16,
				}}
			>
				{/* -------- BROWSE -------- */}
				{flowState === "BROWSE" && (
					<BrowseDriversView
						drivers={drivers}
						userLocation={userLocation}
						onDestinationSelected={(dest) => {
							if (dest.name) {
								setDestination(dest);
							}
						}}
						onSelect={(driverId) => {
							if (!destination) return;
							setSelectedDriver(driverId);
							setFlowState("REQUEST");
						}}
					/>
				)}

				{/* -------- REQUEST -------- */}
				{flowState === "REQUEST" && selectedDriver && destination && (
					<RequestRideView
						driverId={selectedDriver}
						destination={destination}
						onBack={resetFlow}
						onRequestCreated={(id) => {
							setRequestId(id);
							setFlowState("WAITING");
						}}
					/>
				)}

				{/* -------- WAITING -------- */}
				{flowState === "WAITING" && requestId && (
					<RequestStatusView
						requestId={requestId}
						onAccepted={() => setFlowState("CONFIRMED")}
						onCancelled={resetFlow}
					/>
				)}

				{/* -------- CONFIRMED -------- */}
				{flowState === "CONFIRMED" && (
					<Text
						style={{
							fontSize: 22,
							fontWeight: "bold",
							color: "#000",
						}}
					>
						Ride Confirmed 🎉
					</Text>
				)}
			</BottomSheetView>
		</BottomSheet>
	);
}
