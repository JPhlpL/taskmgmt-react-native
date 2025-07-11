import * as SecureStore from "expo-secure-store"

export const saveToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync("access_token", token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // Optional
    })
    console.log("✅ Token saved securely!")
  } catch (error) {
    console.error("❌ Error saving token:", error)
  }
}

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync("access_token")
  } catch (error) {
    console.error("❌ Error retrieving token:", error)
    return null
  }
}

export const deleteToken = async () => {
  try {
    await SecureStore.deleteItemAsync("access_token")
    console.log("🗑️ Token deleted.")
  } catch (error) {
    console.error("❌ Error deleting token:", error)
  }
}
