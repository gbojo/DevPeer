import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ route }: Props) {
  const { username } = route.params;
  const profileUrl = `https://github.com/${username}`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: profileUrl }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
        )}
      />
    </View>
  );
}
