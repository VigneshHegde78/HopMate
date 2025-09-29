import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import "../app/global.css";

export default function Home() {
	const { isSignedIn } = useAuth();

	if (isSignedIn) {
		return <Redirect href={"/(root)/(tabs)/home"} />;
	}
	return <Redirect href={"/(auth)/onboarding"} />;
}
