import React, { createContext, ReactNode, useContext, useState } from "react";

export type UserMode = "RIDER" | "DRIVER";

interface UserModeContextType {
	mode: UserMode | null;
	setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(
	undefined
);

export const UserModeProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setMode] = useState<UserMode | null>(null);

	return (
		<UserModeContext.Provider value={{ mode, setMode }}>
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
