import { SignOutButton } from "@/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function Home() {
  const { user } = useUser();

  const handleSignInPress = () => {
    router.push("/(auth)/sign-in");
  };

  const handleSignUpPress = () => {
    router.push("/(auth)/sign-up");
  };

  const handleCreateTaskPress = () => {
    // Handle create task action
    console.log("Create task pressed");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <SignedIn>
          <ScrollView style={styles.dashboardContainer}>
            <View style={styles.dashboardContent}>
              <View style={styles.header}>
                <View style={styles.welcomeSection}>
                  <Text style={styles.dashboardHeading}>Dashboard</Text>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.userEmail}>
                    {user?.emailAddresses[0].emailAddress}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statsCard}>
                  <View style={styles.statsHeader}>
                    <View style={styles.statsIcon}>
                      <Text style={styles.statsIconText}>📊</Text>
                    </View>
                    <View style={styles.statsContent}>
                      <Text style={styles.statsTitle}>Quick Stats</Text>
                      <Text style={styles.statsSubtitle}>Your productivity overview</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.actionCard}>
                  <Text style={styles.actionTitle}>Ready to be productive?</Text>
                  <Text style={styles.actionSubtitle}>Start managing your tasks efficiently</Text>
                  <Pressable style={styles.actionButton} onPress={handleCreateTaskPress}>
                    <Text style={styles.actionButtonText}>Create Task</Text>
                  </Pressable>
                </View>
              </View>
              
              <View style={styles.signOutContainer}>
                <SignOutButton />
              </View>
            </View>
          </ScrollView>
        </SignedIn>

        <SignedOut>
          <ScrollView style={styles.authContainer}>
            <View style={styles.authContent}>
              <View style={styles.heroSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>T</Text>
                  </View>
                </View>
                
                <Text style={styles.appTitle}>TaskMgmt</Text>
                <Text style={styles.tagline}>
                  Organize your tasks, amplify your productivity
                </Text>
              </View>

              <View style={styles.authButtonGroup}>
                <Pressable 
                  style={[styles.authButton, styles.primaryButton]}
                  onPress={handleSignInPress}
                >
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                </Pressable>

                <Pressable 
                  style={[styles.authButton, styles.secondaryButton]}
                  onPress={handleSignUpPress}
                >
                  <Text style={styles.secondaryButtonText}>Create Account</Text>
                </Pressable>
              </View>

              <View style={styles.featuresList}>
                <Text style={styles.featuresTitle}>Why choose TaskMgmt?</Text>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✨</Text>
                  <Text style={styles.featureText}>Simple and intuitive interface</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🚀</Text>
                  <Text style={styles.featureText}>Boost your productivity</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🔒</Text>
                  <Text style={styles.featureText}>Secure and private</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SignedOut>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  
  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
  },
  dashboardContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  welcomeSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#12121a',
    borderRadius: 20,
    marginTop: 20,
  },
  dashboardHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  
  statsContainer: {
    marginBottom: 32,
  },
  statsCard: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f1f2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsIconText: {
    fontSize: 20,
  },
  statsContent: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  
  actionCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  signOutContainer: {
    alignItems: 'center',
    marginTop: 20,
  },

  // Auth Styles
  authContainer: {
    flex: 1,
  },
  authContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  
  // Button Styles
  authButtonGroup: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  authButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  secondaryButton: {
    backgroundColor: '#1f1f2e',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Features List
  featuresList: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 32,
  },
  featureText: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
});