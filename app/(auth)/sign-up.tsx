import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);

const onSignUpPress = async () => {
  console.log('Signing up...');
  if (!isLoaded) return;
  try {
    const created = await signUp.create({ emailAddress, password });
    console.log('Created user:', created);
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    setPendingVerification(true);
  } catch (err) {
    console.error('Signup Error:', JSON.stringify(err, null, 2));
  }
};

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      {pendingVerification ? (
        <>
          <Text style={styles.heading}>Verify Email</Text>
          <TextInput
            placeholder="Verification code"
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
            style={styles.input}
          />
          <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.heading}>Sign Up</Text>
          <TextInput
            autoCapitalize="none"
            placeholder="Email"
            placeholderTextColor="#999"
            value={emailAddress}
            onChangeText={setEmailAddress}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/sign-in">
              <Text style={styles.link}> Sign in</Text>
            </Link>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#000' },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#999' },
  link: { color: '#00aaff', fontWeight: 'bold' },
});
