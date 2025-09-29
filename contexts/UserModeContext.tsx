import React, { createContext, ReactNode, useContext, useState } from "react";

export type UserMode = "user" | "driver";

interface UserModeContextType {
	mode: UserMode;
	setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(
	undefined
);

export const UserModeProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setMode] = useState<UserMode>("user");

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
