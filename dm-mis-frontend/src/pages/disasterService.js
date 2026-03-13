import { buildApiUrl } from '../config/api';

export const createDisasterReport = async (authToken, formData, photo) => {
  if (!authToken) {
    throw new Error('Authentication token is missing.');
  }

  const formDataPayload = new FormData();
  formDataPayload.append('type', formData.type);
  formDataPayload.append('loss_type', formData.loss_type);
  formDataPayload.append('description', formData.description);
  formDataPayload.append('beneficiary', JSON.stringify(formData.beneficiary));
  if (photo) {
    formDataPayload.append('photo', photo);
  }

  const response = await fetch(buildApiUrl('/api/disasters'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formDataPayload,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to report disaster.');
  }

  return data;
};
