import axios from 'axios';

// Get the local IP or use localhost for development
const getBaseUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'https://ems-backend-server.onrender.com';  // Local development
  } else {
    // If accessing from mobile, replace `localhost` with the local machine IP address
    return `https://ems-backend-server.onrender.com`;
  }
}

// Create a reusable function to make API calls
export const apiCall = async (url, token = null, method = 'GET', data = null) => {
  try {
    const headers = {};

    // Only add Authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Ensure the method is a string and in lowercase (e.g., "get", "post")
    const requestMethod = (typeof method === 'string' && method.toLowerCase()) || 'get';

    // Get the base URL based on the environment (mobile or desktop)
    const baseUrl = getBaseUrl();

    const response = await axios({
      method: requestMethod,  // Use the properly formatted method
      url: `${baseUrl}/${url}`,  // Concatenate the base URL and the endpoint
      headers,  // Use the headers object with or without Authorization
      data: data,  // Send data if it's a POST, PUT, etc.
      withCredentials: true
    });

    return response.data;  // Return the data from the API response
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;  // Propagate the error so it can be handled where the function is used
  }
};
