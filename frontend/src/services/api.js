

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  
});

// Patient endpoints
export const createPatient = (patientData) => API.post('/api/patients', patientData);
export const getPatient = (email) => API.get(`/api/patients/${email}`);
export const updatePatient = (email, patientData) => API.put(`/api/patients/${email}`, patientData);

// Caretaker endpoints
export const createCaretaker = (caretakerData) => API.post('/api/caretakers', caretakerData);
export const getCaregiverById = (id) => API.get(`/api/caretakers/${id}`);
export const getCaretaker = (email) => API.get(`/api/caretakers/email/${email}`);
export const getCaretakers = () => API.get('/api/caretakers/');
export const updateCaretaker = (email, caretakerData) => API.put(`/api/caretakers/${email}`, caretakerData);
export const getCaregiversByEmails = (emails) =>
  API.post('/api/caretakers/by-emails', { emails });

export const loginUser = (formData) =>
  // console.log(process.env.REACT_APP_API_URL);
  API.post('/api/auth/login', {formData});


// Add this normalization function
const normalizeMessages = (response) => {
  // If response is already an array
  if (Array.isArray(response)) return response;
  
  // If response has data array
  if (response.data && Array.isArray(response.data)) return response.data;
  
  // If single message object
  if (response._id) return [response];
  
  // If response has data object
  if (response.data && response.data._id) return [response.data];
  
  // Default to empty array
  return [];
};

// Update your API functions
export const getMessages = async (patientEmail, caregiverEmail) => {
  const response = await API.get(`/api/messages/${patientEmail}/${caregiverEmail}`);
  return normalizeMessages(response);
};

export const sendMessage = async (patientEmail, caregiverEmail, content) => {
  const response = await API.post('/api/messages/send', { patientEmail, caregiverEmail, content });
  return normalizeMessages(response)[0]; // Return single message
};

export const addCaregiver = (patientEmail, caregiverEmail) =>
  API.post('/api/patients/add-caregiver', { patientEmail, caregiverEmail });

export const removeCaregiver = (patientEmail, caregiverEmail) =>
  API.post('/api/messages/remove', {
    patientEmail,
    caregiverEmail,
  });


// In your api.js
API.interceptors.response.use(
  response => {
    // Ensure data is always an array for messages
    if (response.config.url.includes('/api/messages/')) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
    return response.data;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

// Add response interceptor for error handling
// API.interceptors.response.use(
//   response => response,
//   error => {
//     console.error('API Error:', error);
//     return Promise.reject(error);
//   }
// );

export default API;
