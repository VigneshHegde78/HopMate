/* ================= COMMON TYPES ================= */

export type SeatStatus = "AVAILABLE" | "FULL";

export type VehicleType = "AUTO" | "BIKE" | "SUV" | "SEDAN";

export type DriverDoc = {
	id: string;
	name: string;
	vehicleType?: VehicleType;
	vehicleModel?: string;
	plateNumber?: string;
	latitude: number;
	longitude: number;
	seatStatus: SeatStatus;
};

export type RideRequest = {
	id: string;
	destinationName: string;
	seatsRequested: number;
};

export type Location = {
	latitude: number;
	longitude: number;
};

export type Destination = Location & {
	name: string;
	address?: string;
};

export type UserMode = "RIDER" | "DRIVER";
