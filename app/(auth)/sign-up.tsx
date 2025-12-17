// sign-up.tsx
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useUserMode } from "@/contexts/UserModeContext";
import { account, tableDB } from "@/lib/appwrite";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
    const formatDateDDMMYYYY = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };


    const { signUp, isLoaded } = useSignUp();
    const { startSSOFlow } = useSSO();
    const router = useRouter();
    const { setMode } = useUserMode();
    const a = account;



    const [selectedRole, setSelectedRole] = useState<"driver" | "rider" | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSelected, setIsSelected] = useState(false);
    const [step, setStep] = useState(1);


    // Google SSO
    const onPressGoogle = useCallback(async () => {
        if (!selectedRole) return;
        try {
            const { createdSessionId } = await startSSOFlow({
                strategy: "oauth_google",
                redirectUrl: AuthSession.makeRedirectUri(),
            });
            if (createdSessionId) {
                await setMode(selectedRole);
                router.replace("/(root)/(tabs)/home");
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    }, [selectedRole, startSSOFlow, setMode, router]);




    // Email/Password Sign Up
    const onSignUpPress = async () => {
        if (!isLoaded || !selectedRole) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // 1️⃣ Create Appwrite account
            const user = await account.create(
                ID.unique(),
                email.trim(),
                password,
                username.trim()
            );

            console.log("Auth user created:", user);

            // 2️⃣ Create session FIRST
            await account.createEmailPasswordSession({
                email: email,
                password: password,
            });

            // 3️⃣ Create table row (profile)
            const res = await tableDB.createRow({
                databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                tableId: process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!,
                rowId: user.$id, // one row per user
                data: {
                    UserID: user.$id,
                    Name: user.name || username,
                    Email: user.email,
                    Role: selectedRole, // ✅ rider / driver
                    AboutMe: "",
                    Gender: "",
                    DateOfBirth: null,
                    MemberSince: formatDateDDMMYYYY(new Date()),
                    PhoneNo: "",
                    userName: username.trim()
                },
                permissions: [
                    `read("user:${user.$id}")`,
                    `update("user:${user.$id}")`,
                    `delete("user:${user.$id}")`,
                ],
            });

            console.log("User profile created:", res);

            // 4️⃣ Save mode & redirect
            setMode(selectedRole);
            router.replace("/(root)/(tabs)/home");

        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Signup failed");
        }
    };


    const onContinuePress = () => {
        if (isSelected) setStep(2);
    };

    // Step 1: Role selection
    if (step === 1) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-between px-6">
                <View className="w-full space-y-6 mt-10">
                    <Text className="text-3xl font-figtreeExtraBold text-gray-700 mb-12">
                        Let’s get you started — choose your role!
                    </Text>

                    <View className={`${isSelected && selectedRole === "rider" ? "border-8 border-blue-700 rounded-3xl p-1" : ""} mb-6`}>
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-blue-700 rounded-xl shadow-md"
                            onPress={() => {
                                setSelectedRole("rider");
                                setIsSelected(true);
                            }}
                        >
                            <Image source={images.rider} resizeMode="contain" className="w-40 h-40" />
                            <Text className="text-white text-xl font-lexendSemiBold ml-4">Rider</Text>
                        </TouchableOpacity>
                    </View>

                    <View className={`${isSelected && selectedRole === "driver" ? "border-8 border-yellow-500 rounded-3xl p-1" : ""} mb-6`}>
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-yellow-500 rounded-xl shadow-md"
                            onPress={() => {
                                setSelectedRole("driver");
                                setIsSelected(true);
                            }}
                        >
                            <Text className="ml-4 text-white text-xl font-lexendSemiBold">Driver</Text>
                            <Image source={images.driver} resizeMode="contain" className="w-40 h-40 tint-white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <CustomButton
                    title="Continue"
                    onPress={onContinuePress}
                    disabled={!selectedRole}
                    className="w-full mt-12 rounded-2xl py-3 mb-5 items-center"
                    bgVariant="default"
                />
            </SafeAreaView>
        );
    }

    // Step 2: Sign-up Form
    return (
        <SafeAreaView className="w-full h-full px-6 bg-gray-100">
            <View className="my-4 mt-10">
                <Text className="text-3xl font-figtreeBold">Create your account</Text>
                <Text className="text-[#858585] font-figtreeSemiBold mb-5">
                    Sign up as {selectedRole}.
                </Text>
            </View>

            <InputField
                iconName="person-outline"
                placeholder="Enter Name"
                placeholderTextColor={"#858585"}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
            />

            <InputField
                iconName="mail-outline"
                placeholder="your@email.com"
                placeholderTextColor="#858585"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <InputField
                iconName="lock-outline"
                placeholder="Enter password"
                placeholderTextColor="#858585"
                value={password}
                onChangeText={setPassword}
                isPassword
            />

            <InputField
                iconName="lock-outline"
                placeholder="Confirm password"
                placeholderTextColor="#858585"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
            />

            <Text className="text-red-600 mb-2">{error}</Text>

            <CustomButton
                title="Sign Up"
                onPress={onSignUpPress}
                className="rounded-2xl py-3 items-center mb-1"
                bgVariant="default"
            />

            <View className="flex-row items-center my-4">
                <View className="flex-1 h-[1px] bg-black" />
                <Text className="mx-3 text-gray-500 font-semibold">OR</Text>
                <View className="flex-1 h-[1px] bg-black" />
            </View>

            <CustomButton
                title="Sign in with Google"
                IconLeft={() => (
                    <Image source={icons.google} resizeMode="contain" className="w-6 h-6" />
                )}
                onPress={onPressGoogle}
                className="border border-gray-300 mt-2 shadow-black items-center bg-blue-500"
                bgVariant="outline"
                textVariant="primary"
            />

            <CustomButton
                title="Already have an account? Sign In"
                onPress={() => router.replace("/(auth)/sign-in")}
                className="rounded-2xl py-3 my-3 items-center"
                bgVariant="secondary"
            />
        </SafeAreaView>
    );
}
