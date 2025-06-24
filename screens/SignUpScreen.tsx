import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { isValidGitHubUser } from '../utils/githubApi';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const savedUsername = await AsyncStorage.getItem('githubUsername');
      if (savedUsername) {
        navigation.replace('Map');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleSignUp = async () => {
    const trimmed = username.trim();
    const isValid = await isValidGitHubUser(trimmed);
    if (!isValid) {
      Alert.alert('Invalid Username', 'There is no such username on GitHub.');
      return;
    }

    await AsyncStorage.setItem('githubUsername', trimmed);
    navigation.replace('Map');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome to DevPeer</Text>
      <Text style={styles.subtitle}>
        Connect with developers near you by signing in with your GitHub username.
      </Text>

      <Text style={styles.label}>Enter GitHub Username:</Text>
      <TextInput
        placeholder="e.g. torvalds"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 8,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
