export const API_BASE_URL = '/api/v1';

export const getCurrentUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.sub,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
};

export const fetchWithAuth = async (url, options = {}) => {
  const currentUser = getCurrentUserFromToken();
  const headers = {
    'X-User-Id': currentUser?.username || 'anonymous_user',
    'X-User-Name': currentUser?.username || 'Anonymous User',
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
