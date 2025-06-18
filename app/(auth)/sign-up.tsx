import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const created = await signUp.create({ emailAddress, password });
      console.log('Created user:', created);
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.error('Signup Error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInPress = () => {
    router.push('/(auth)/sign-in');
  };

  const handleBackPress = () => {
    setPendingVerification(false);
    setCode('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {pendingVerification ? (
            <>
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>📧</Text>
                  </View>
                </View>
                
                <Text style={styles.title}>Check Your Email</Text>
                <Text style={styles.subtitle}>
                  We sent a verification code to {emailAddress}
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <TextInput
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#6b7280"
                    value={code}
                    onChangeText={setCode}
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <Pressable 
                  onPress={onVerifyPress} 
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  disabled={isLoading || !code}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </Text>
                </Pressable>

                <Pressable onPress={handleBackPress} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Back to Sign Up</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>T</Text>
                  </View>
                </View>
                
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join TaskMgmt and boost your productivity</Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    autoCapitalize="none"
                    placeholder="Enter your email"
                    placeholderTextColor="#6b7280"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    style={styles.input}
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    placeholder="Create a password"
                    placeholderTextColor="#6b7280"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    autoComplete="password-new"
                  />
                  <Text style={styles.passwordHint}>
                    Password must be at least 8 characters
                  </Text>
                </View>

                <Pressable 
                  onPress={onSignUpPress} 
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  disabled={isLoading || !emailAddress || !password}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={handleSignInPress}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  headerSection: {
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#12121a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f1f2e',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  passwordHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#1f1f2e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#4b5563',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    color: '#6366f1',
    fontWeight: 'bold',
    fontSize: 14,
  },
});