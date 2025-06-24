import axios from 'axios';

//const BASE_URL = 'http://localhost:3000'; // Change to LAN IP if testing on a real device
const BASE_URL = 'http://192.168.1.252:3000'; 


export const registerUser = async (user: {
  username: string;
  lat: number;
  lng: number;
  avatarUrl: string;
}) => {
  try {
    const existing = await axios.get(`${BASE_URL}/users?username=${user.username}`);
    if (existing.data.length === 0) {
      return axios.post(`${BASE_URL}/users`, user);
    }
  } catch (err) {
    console.error('User registration error:', err);
  }
};

export const fetchUsers = async () => {
  const res = await axios.get(`${BASE_URL}/users`);
  return res.data;
};
