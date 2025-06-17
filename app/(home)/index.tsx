// app/(home)/index.tsx
import { SignOutButton } from "@/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text style={styles.heading}>Dashboard</Text>
        <Text style={styles.text}>
          Welcome, {user?.emailAddresses[0].emailAddress}
        </Text>
        <SignOutButton />
      </SignedIn>

      <SignedOut>
        <Text style={styles.heading}>Welcome to TaskMgmt</Text>
        <View style={styles.buttonGroup}>
  {Platform.OS === 'web' ? (
  <Link href="/(auth)/sign-in">
    <Text style={styles.buttonText}>Sign In</Text>
  </Link>
) : (
  <Link href="/(auth)/sign-in" asChild>
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>Sign In</Text>
    </TouchableOpacity>
  </Link>
)}

  <Link href="/(auth)/sign-up" asChild>
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>Sign Up</Text>
    </TouchableOpacity>
  </Link>
</View>

      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
    // gap: 12, ❌ REMOVE THIS
  },

  button: {
    backgroundColor: "#007aff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
