export const API_BASE_URL = '/api/v1';

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'X-User-Id': 'user_123', // Hardcoded for Module C, to be replaced with real Auth later
    'X-User-Name': 'John Doe',
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
    }
  });
  
  // Try to parse JSON. If response is empty or non-JSON, we handle it calmly.
  let data;
  try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
  } catch (e) {
      data = {};
  }
  
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }
  
  return data;
};
