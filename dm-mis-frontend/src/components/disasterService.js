import { buildApiUrl } from '../config/api';

const API_URL = buildApiUrl('/api/disasters');

export const createDisasterReport = async (authToken, formData, photo, submissionType = 'REPORTED') => {
  if (!authToken) {
    throw new Error('Authentication token is missing.');
  }

  const formDataPayload = new FormData();
  formDataPayload.append('type', formData.type);
  formDataPayload.append('loss_type', formData.loss_type);
  formDataPayload.append('description', formData.description);
  formDataPayload.append('beneficiary', JSON.stringify(formData.beneficiary));
  formDataPayload.append('submissionType', submissionType);

  if (photo) {
    formDataPayload.append('photo', photo);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formDataPayload,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to report disaster.');
  }

  return data;
};

export const updateDisasterStatus = async (authToken, disasterId, status) => {
  if (!authToken) {
    throw new Error('Authentication token is missing.');
  }

  const response = await fetch(`${API_URL}/${disasterId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update disaster status.');
  }

  return data;
};
