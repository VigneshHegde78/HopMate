import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useRef, useState } from "react";
import { Text } from "react-native";
import BrowseDriversView from "../app/(root)/browse-drivers";
import RequestRideView from "../app/(root)/request-ride";
import RequestStatusView from "../app/(root)/request-status";

type NearbyDriver = {
	id: string;
	seatStatus: "AVAILABLE" | "FULL";
};

type Destination = {
	name: string;
	latitude: number;
	longitude: number;
};

type Props = {
	drivers: NearbyDriver[];
};

export default function CustomBottomSheet({ drivers }: Props) {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["40%", "60%", "85%"], []);
	const [flowState, setFlowState] = useState<
		"BROWSE" | "REQUEST" | "WAITING" | "CONFIRMED"
	>("BROWSE");

	const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
	const [destination, setDestination] = useState<Destination | null>(null);
	const [requestId, setRequestId] = useState<string | null>(null);
	const handleBack = () => {
		if (flowState === "REQUEST") {
			setFlowState("BROWSE");
			setSelectedDriver(null);
		}

		if (flowState === "WAITING") {
			setFlowState("BROWSE");
			setSelectedDriver(null);
			setRequestId(null);
		}

		if (flowState === "CONFIRMED") {
			setFlowState("BROWSE");
			setSelectedDriver(null);
			setRequestId(null);
		}
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
				{flowState === "BROWSE" && (
					<BrowseDriversView
						drivers={drivers}
						onDestinationSelected={(dest) => {
							if (dest.name) {
								setDestination(dest as Destination);
							}
						}}
						onSelect={(driverId) => {
							if (!destination) return;
							setSelectedDriver(driverId);
							setFlowState("REQUEST");
						}}
					/>
				)}

				{flowState === "REQUEST" && selectedDriver && destination && (
					<RequestRideView
						driverId={selectedDriver}
						destination={destination}
						onBack={handleBack}
						onRequestCreated={(id) => {
							setRequestId(id);
							setFlowState("WAITING");
						}}
					/>
				)}

				{flowState === "WAITING" && requestId && (
					<RequestStatusView
						requestId={requestId}
						onAccepted={() => setFlowState("CONFIRMED")}
						onCancelled={() => {
							setFlowState("BROWSE");
							setSelectedDriver(null);
							setRequestId(null);
						}}
					/>
				)}

				{flowState === "CONFIRMED" && (
					<Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>
						Ride Confirmed 🎉
					</Text>
				)}
			</BottomSheetView>
		</BottomSheet>
	);
}
