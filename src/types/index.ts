export type UserProfile = {
  id: string;
  name: string;
  skills: string[];
  location?: Location;
};

type Location = {
  latitude: number;
  longitude: number;
};