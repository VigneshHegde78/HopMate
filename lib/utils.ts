import { Ride } from "@/types/type";

export const sortRides = (rides: Ride[]): Ride[] => {
	const result = rides.sort((a, b) => {
		const dateA = new Date(`${a.created_at}T${a.ride_time}`);
		const dateB = new Date(`${b.created_at}T${b.ride_time}`);
		return dateB.getTime() - dateA.getTime();
	});

	return result.reverse();
};

export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) {
	const R = 6371; // Earth radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // distance in km
}

export function formatTime(minutes: number): string {
	const formattedMinutes = +minutes?.toFixed(0) || 0;

	if (formattedMinutes < 60) {
		return `${minutes} min`;
	} else {
		const hours = Math.floor(formattedMinutes / 60);
		const remainingMinutes = formattedMinutes % 60;
		return `${hours}h ${remainingMinutes}m`;
	}
}

export const formatDateString = (date?: Date | string | null) => {
	if (!date) return "Not Found";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});
};

export const parseDDMMYYYY = (dob: string): Date | null => {
	if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) return null;

	const [day, month, year] = dob.split("-").map(Number);
	const date = new Date(year, month - 1, day);

	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}

	return date;
};

export function formatDate(dateString: string): string {
	if (dateString == null) return "Not Found";

	const date =
		dateString.includes("-") && dateString.split("-")[0].length === 2
			? parseDDMMYYYY(dateString)
			: new Date(dateString);

	if (!date || isNaN(date.getTime())) return "Invalid Date";

	const day = date.getDate();
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const month = monthNames[date.getMonth()];
	const year = date.getFullYear();

	return `${day < 10 ? "0" + day : day} ${month} ${year}`;
}

// ISO (Appwrite) → DD-MM-YYYY
export const isoToDDMMYYYY = (iso: string): string => {
	if (!iso) return "";

	const date = new Date(iso);
	if (isNaN(date.getTime())) return "";

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();

	return `${day}-${month}-${year}`;
};

// DD-MM-YYYY → ISO (for Appwrite save)
export const ddmmyyyyToISO = (dateStr: string): string => {
	const [day, month, year] = dateStr.split("-");

	if (!day || !month || !year) return "";

	const date = new Date(Number(year), Number(month) - 1, Number(day));
	return date.toISOString();
};

// Auto format while typing → DD-MM-YYYY
export const formatDOB_DDMMYYYY = (text: string): string => {
	const cleaned = text.replace(/\D/g, "");

	if (cleaned.length <= 2) return cleaned;
	if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;

	return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
};

// Validate date
export const isValidDDMMYYYY = (dateStr: string): boolean => {
	const [day, month, year] = dateStr.split("-").map(Number);
	if (!day || !month || !year) return false;

	const date = new Date(year, month - 1, day);
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
};

// Age calculation
export const calculateAge = (dob: string): number => {
	const [day, month, year] = dob.split("-").map(Number);
	const birthDate = new Date(year, month - 1, day);
	const today = new Date();

	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();

	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	return age;
};

export const isAbove18 = (dob: string): boolean => calculateAge(dob) >= 18;
