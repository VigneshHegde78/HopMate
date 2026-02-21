import { account, tableDB } from "@/lib/appwrite";
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export type UserMode = "RIDER" | "DRIVER";

interface UserModeContextType {
	mode: UserMode | null;
	setMode: (mode: UserMode) => void;
	loading: boolean;
}

const UserModeContext = createContext<UserModeContextType | undefined>(
	undefined,
);

export const UserModeProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setMode] = useState<UserMode | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadMode = async () => {
			try {
				const user = await account.get();
				const profile = await tableDB.getRow({
					databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
					tableId: process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!,
					rowId: user.$id,
				});

				const role = profile?.Role;
				if (role === "RIDER" || role === "DRIVER") {
					if (isMounted) setMode(role);
				} else if (isMounted) {
					setMode(null);
				}
			} catch {
				if (isMounted) setMode(null);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		loadMode();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<UserModeContext.Provider value={{ mode, setMode, loading }}>
			{children}
		</UserModeContext.Provider>
	);
};

export const useUserMode = () => {
	const context = useContext(UserModeContext);
	if (context === undefined) {
		throw new Error("useUserMode must be used within a UserModeProvider");
	}
	return context;
};
