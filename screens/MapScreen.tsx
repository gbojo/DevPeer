import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Button, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

type User = {
  id: string;
  username: string;
  lat: number;
  lng: number;
};

/** ───── TEMPORARY: mock community users ───── */
const mockUsers: User[] = [
  { id: '1', username: 'torvalds', lat: 37.7749, lng: -122.4194 },
  { id: '2', username: 'gaearon', lat: 37.8044, lng: -122.2712 },
];

export default function MapScreen({ navigation }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** ─────────── Get username + location on mount ─────────── */
  useEffect(() => {
    (async () => {
      try {
        const username = await AsyncStorage.getItem('githubUsername');

        if (!username) {
          navigation.replace('SignUp');
          return;
        }

        /* Request permission */
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required to show you on the map.');
          setLoading(false);
          return;
        }

        /* Get current coordinates */
        const { coords } = await Location.getCurrentPositionAsync({});
        setCurrentUser({
          id: 'me',
          username,
          lat: coords.latitude,
          lng: coords.longitude,
        });
      } catch (err) {
        console.warn(err);
        Alert.alert('Error', 'Unable to fetch location.');
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

  /** Map region centered on the current user */
  const initialRegion: Region = {
    latitude: currentUser.lat,
    longitude: currentUser.lng,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion} showsUserLocation>
        {/* Logged-in user marker */}
        <Marker
          key={currentUser.id}
          coordinate={{ latitude: currentUser.lat, longitude: currentUser.lng }}
          pinColor="dodgerblue"
          onPress={() => setSelectedUser(currentUser)}
        >
          <View style={{ backgroundColor: '#fff', padding: 5, borderRadius: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>
              {currentUser.username[0].toUpperCase()}
            </Text>
          </View>
        </Marker>

        {/* Community users (demo) */}
        {mockUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.lat, longitude: user.lng }}
            onPress={() => setSelectedUser(user)}
          >
            <View style={{ backgroundColor: '#fff', padding: 5, borderRadius: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>
                {user.username[0].toUpperCase()}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Logout for dev/testing */}
      <View style={{ padding: 16 }}>
        <Button
          title="Logout"
          onPress={async () => {
            await AsyncStorage.removeItem('githubUsername');
            navigation.replace('SignUp');
          }}
        />
      </View>

      {/* User info modal */}
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
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              👤 {selectedUser?.username}
            </Text>
            <Button
              title="View GitHub Profile"
              onPress={() => {
                if (selectedUser) {
                  navigation.navigate('Profile', { username: selectedUser.username });
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
