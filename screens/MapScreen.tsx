import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { registerUser, fetchUsers } from '../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

type User = {
  id?: number;
  username: string;
  lat: number;
  lng: number;
  avatarUrl: string;
};

export default function MapScreen({ navigation }: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const username = await AsyncStorage.getItem('githubUsername');
        if (!username) {
          navigation.replace('SignUp');
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location permission is required.');
          setLoading(false);
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        const newUser: User = {
          username,
          lat: coords.latitude,
          lng: coords.longitude,
          avatarUrl: `https://github.com/${username}.png`,
        };

        await registerUser(newUser); // Send to backend
        setCurrentUser(newUser);

        const users = await fetchUsers(); // Fetch all from backend
        setAllUsers(users);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Something went wrong loading map data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: currentUser.lat,
    longitude: currentUser.lng,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        {allUsers.map((user) => (
          <Marker
            key={user.id || user.username}
            coordinate={{ latitude: user.lat, longitude: user.lng }}
            onPress={() => setSelectedUser(user)}
          >
            <Image
              source={{ uri: user.avatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          </Marker>
        ))}
      </MapView>

      <View style={{ padding: 16 }}>
        <Button
          title="Logout"
          onPress={async () => {
            await AsyncStorage.removeItem('githubUsername');
            navigation.replace('SignUp');
          }}
        />
      </View>

      <Modal
        visible={!!selectedUser}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 12,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Image
              source={{ uri: selectedUser?.avatarUrl }}
              style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 10 }}
            />
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              👤 {selectedUser?.username}
            </Text>
            <Button
              title="View GitHub Profile"
              onPress={() => {
                if (selectedUser) {
                  navigation.navigate('Profile', {
                    username: selectedUser.username,
                  });
                }
                setSelectedUser(null);
              }}
            />
            <View style={{ height: 10 }} />
            <Button title="Close" onPress={() => setSelectedUser(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
