const API_URL = 'http://localhost:5000/api/disasters';

/**
 * Creates a new disaster report by sending data to the backend API.
 * @param {string} authToken - The user's authentication token.
 * @param {object} reportData - The main data for the report (e.g., type, description, beneficiary).
 * @returns {Promise<object>} The response data from the server.
 * @throws {Error} If the auth token is missing or the API call fails.
 */
export const createDisasterReport = async (authToken, reportData) => {
  if (!authToken) {
    throw new Error('Authentication token is missing.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(reportData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create disaster report.');
  }

  return data;
};