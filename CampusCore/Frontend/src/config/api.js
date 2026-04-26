import axios from 'axios';

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
  const token = localStorage.getItem('token');
  
  const headers = {
    'X-User-Id': currentUser?.username || 'anonymous_user',
    'X-User-Name': currentUser?.username || 'Anonymous User',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  // Determine if body should be parsed as JSON or used as is (e.g. FormData)
  let requestData = options.body;
  if (options.headers?.['Content-Type'] === 'application/json' && typeof options.body === 'string') {
    try {
      requestData = JSON.parse(options.body);
    } catch (e) {
      // Keep as string if parsing fails
    }
  }

  const fullUrl = `${API_BASE_URL}${url}`;
  
  try {
    const response = await axios({
      url: fullUrl,
      method: options.method || 'GET',
      data: requestData,
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error(`API Error at ${fullUrl}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        throw new Error('🔐 Access Denied: You don\'t have the required permissions for this action.');
      }
      if (status === 404) {
        throw new Error('🔍 Not Found: The resource you\'re looking for has vanished into the digital void!');
      }
      const message = error.response.data?.message || error.response.data || `🚀 Houston, we have a problem (Error ${status})`;
      throw new Error(message);
    } else if (error.request) {
      throw new Error('📡 Connection Lost: Our digital pigeons are having trouble reaching the server. Please try again later!');
    } else {
      throw new Error(`✨ Something went slightly wrong: ${error.message}`);
    }
  }
};
