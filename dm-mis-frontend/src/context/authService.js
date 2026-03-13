import { API_BASE_URL, buildApiUrl } from '../config/api';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(buildApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    let data = {};
    try {
      data = await response.json();
    } catch (parseError) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach backend at ${API_BASE_URL}. Start backend and check API base URL.`);
    }
    throw error;
  }
};
