import React, { useState } from 'react';
import { View, Text, Modal, Button } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

type User = {
  id: string;
  username: string;
  lat: number;
  lng: number;
};

const mockUsers: User[] = [
  { id: '1', username: 'torvalds', lat: 37.7749, lng: -122.4194 },
  { id: '2', username: 'gaearon', lat: 37.8044, lng: -122.2712 },
];

export default function MapScreen({ navigation }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const initialRegion: Region = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.4,
    longitudeDelta: 0.4,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
      >
        {mockUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.lat, longitude: user.lng }}
            onPress={() => setSelectedUser(user)}
          >
            <View style={{ backgroundColor: '#fff', padding: 5, borderRadius: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>{user.username[0].toUpperCase()}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <Modal
        visible={!!selectedUser}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 12,
            width: '80%',
            alignItems: 'center',
          }}>
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
