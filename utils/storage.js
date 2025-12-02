import * as SecureStore from 'expo-secure-store';

export const saveSecureData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await SecureStore.setItemAsync(key, jsonValue);
    }
    catch (error) {
        console.error('Error saving secure data:', error);
    }
};

export const getSecureData = async (key) => {
    try {
        const jsonValue = await SecureStore.getItemAsync(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    }
    catch (error) {
        console.error('Error retrieving secure data:', error);
        return null;
    }
};

export const deleteSecureData = async (key) => {
    try {
        await SecureStore.deleteItemAsync(key);
    }
    catch (error) {
        console.error('Error deleting secure data:', error);
    }
};