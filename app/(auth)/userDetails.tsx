import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { account, tableDB } from '../../lib/appwrite';

const UserDetails = () => {

  const formatDateDDMMYYYY = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    const use = account.get();
    try {
      const res = await tableDB.listRows({
        databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID!,

      });

      console.log("Fetched user:", res);
      // setUser(res);
      // setName(res.name);
      // setAge(String(res.age));
      // setGender(res.gender);
    } catch (error) {
      console.error("Error fetching row:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    setLoading(true);

    try {
      const user = await account.get();

      const res = await tableDB.createRow({
        databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID!,
        rowId: user.$id, // ✅ one profile per auth user
        data: {
          UserID: user.$id,                  // ✔ matches column
          Name: user.name || "John Doe",
          Email: user.email,
          Role: "user",
          AboutMe: "",
          Gender: "",
          DateOfBirth: null,
          MemberSince: formatDateDDMMYYYY(new Date(user.$createdAt)),
          PhoneNo: "",
        },
        permissions: [
          `read("user:${user.$id}")`,
          `update("user:${user.$id}")`,
          `delete("user:${user.$id}")`,
        ],
      });

      console.log("User created:", res);
    } catch (error) {
      console.error("Error creating row:", error);
    } finally {
      setLoading(false);
    }
  };


  const updateUser = async () => {
    setLoading(true);
    try {
      const res = await tableDB.updateRow({
        databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID!,
        rowId: "2222",
        data: {
          name,
          age: Number(age),
          gender,
        },
      });

      setUser(res);
    } catch (error) {
      console.error("Error updating row:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-900">
      <View className="p-4 space-y-4">
        <TouchableOpacity
          onPress={createUser}
          className="bg-blue-600 p-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold">
            Create User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={fetchUser}
          className="bg-green-600 p-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold">
            Fetch User
          </Text>
        </TouchableOpacity>

        {loading && (
          <Text className="text-white text-center">Loading...</Text>
        )}

        {user && (
          <View className="bg-neutral-900 p-4 rounded-2xl space-y-3">
            <Text className="text-white text-lg font-bold">
              User Details
            </Text>

            <Text className="text-gray-300">Name: {user.name}</Text>
            <Text className="text-gray-300">Age: {user.age}</Text>
            <Text className="text-gray-300">Gender: {user.gender}</Text>

            <TextInput
              className="bg-neutral-800 text-white px-3 py-2 rounded-xl"
              placeholder="Name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              className="bg-neutral-800 text-white px-3 py-2 rounded-xl"
              placeholder="Age"
              placeholderTextColor="#9ca3af"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />

            <TextInput
              className="bg-neutral-800 text-white px-3 py-2 rounded-xl"
              placeholder="Gender"
              placeholderTextColor="#9ca3af"
              value={gender}
              onChangeText={setGender}
            />

            <TouchableOpacity
              onPress={updateUser}
              className="bg-yellow-500 p-3 rounded-xl"
            >
              <Text className="text-black text-center font-semibold">
                Update User
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserDetails;
