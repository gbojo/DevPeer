import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { isValidGitHubUser } from '../utils/githubApi';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  //console.log("SignUpScreen rendered");
  const [username, setUsername] = useState('');

  const handleSignUp = async () => {
    const isValid = await isValidGitHubUser(username.trim());
    if (!isValid) {
      Alert.alert('Invalid Username', 'There is no such username on GitHub.');
      return;
    }

    // Save to local storage if desired
    navigation.replace('Map');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter GitHub Username:</Text>
      <TextInput
        placeholder="e.g. torvalds"
        value={username}
        onChangeText={setUsername}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
