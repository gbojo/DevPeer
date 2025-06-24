import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { isValidGitHubUser } from '../utils/githubApi';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Check storage on first load
  useEffect(() => {
    const checkUser = async () => {
      const savedUsername = await AsyncStorage.getItem('githubUsername');
      if (savedUsername) {
        navigation.replace('Map');
      } else {
        setLoading(false); // Show form if not signed in
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>Enter GitHub Username:</Text>
      <TextInput
        placeholder="e.g. torvalds"
        value={username}
        onChangeText={setUsername}
        style={{ borderBottomWidth: 1, marginBottom: 20, padding: 8 }}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
