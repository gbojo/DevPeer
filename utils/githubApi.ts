import axios from 'axios';

export const isValidGitHubUser = async (username: string): Promise<boolean> => {
  try {
    const res = await axios.get(`https://api.github.com/users/${username}`);
    return res.status === 200;
  } catch (err) {
    return false;
  }
};
