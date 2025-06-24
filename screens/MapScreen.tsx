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

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

type User = {
  id: string;
  username: string;
  lat: number;
  lng: number;
  avatarUrl?: string;
};

/** ───── TEMPORARY: mock community users ───── */
const mockUsers: User[] = [
  { id: '1', username: 'torvalds', lat: 37.7749, lng: -122.4194 },
  { id: '2', username: 'gaearon', lat: 37.8044, lng: -122.2712 },
  { id: '3', username: 'sindresorhus', lat: 37.7849, lng: -122.4294 },
  { id: '4', username: 'yyx990803', lat: 37.7949, lng: -122.4094 },
  { id: '5', username: 'tj', lat: 37.7649, lng: -122.4494 },
  { id: '6', username: 'kentcdodds', lat: 37.7740, lng: -122.4190 },
  { id: '7', username: 'addyosmani', lat: 37.7840, lng: -122.4280 },
  { id: '8', username: 'driesvints', lat: 37.7940, lng: -122.4380 },
  { id: '9', username: 'thekitze', lat: 37.7540, lng: -122.4180 },
  { id: '10', username: 'rauchg', lat: 37.7440, lng: -122.4080 },
].map((user) => ({
  ...user,
  avatarUrl: `https://github.com/${user.username}.png`,
}));

export default function MapScreen({ navigation }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
          Alert.alert(
            'Permission denied',
            'Location permission is required to show your location on the map.'
          );
          setLoading(false);
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        setCurrentUser({
          id: 'me',
          username,
          lat: coords.latitude,
          lng: coords.longitude,
          avatarUrl: `https://github.com/${username}.png`,
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

  const initialRegion: Region = {
    latitude: currentUser.lat,
    longitude: currentUser.lng,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        {/* Current user marker */}
        <Marker
          key={currentUser.id}
          coordinate={{ latitude: currentUser.lat, longitude: currentUser.lng }}
          onPress={() => setSelectedUser(currentUser)}
          pinColor="dodgerblue"
        >
          <Image
            source={{ uri: currentUser.avatarUrl }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
        </Marker>

        {/* Mock users */}
        {mockUsers.map((user) => (
          <Marker
            key={user.id}
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

      {/* Logout button for testing */}
      <View style={{ padding: 16 }}>
        <Button
          title="Logout"
          onPress={async () => {
            await AsyncStorage.removeItem('githubUsername');
            navigation.replace('SignUp');
          }}
        />
      </View>

      {/* Tooltip Modal */}
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
