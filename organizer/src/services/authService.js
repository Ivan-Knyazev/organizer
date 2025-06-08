import apiClient from './api';

// Simulate API calls
export const loginUser = async (credentials) => {
  console.log('Attempting login with:', credentials);
  // Simulated API call
  // return apiClient.post('/auth/login', credentials).then(response => response.data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === 'user@example.com' && credentials.password === 'password') {
        resolve({ 
          token: 'fake-jwt-token', 
          user: { id: 1, email: 'user@example.com', fullname: 'Иван Иванов', age: 30, contacts: '+79991234567' } 
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const registerUser = async (userData) => {
  console.log('Attempting registration with:', userData);
  // Simulated API call
  // return apiClient.post('/auth/register', userData).then(response => response.data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        token: 'new-fake-jwt-token', 
        user: { id: 2, ...userData } 
      });
    }, 1000);
  });
};

export const fetchUserProfile = async () => {
  console.log('Fetching user profile...');
  // Simulated API call
  // return apiClient.get('/users/me').then(response => response.data);
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('authToken');
    setTimeout(() => {
      if (token) { // Simple check, backend would validate token
        resolve({
          email: 'user@example.com',
          fullname: 'Иванов Иван Иванович',
          age: 30,
          contacts: '+7 (999) 123-45-67',
          telegramHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0'
        });
      } else {
        reject(new Error('Not authenticated'));
      }
    }, 500);
  });
};

export const updateUserProfileAPI = async (profileData) => {
  console.log('Updating profile with:', profileData);
  // return apiClient.put('/users/me', profileData).then(response => response.data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...profileData, message: 'Profile updated successfully' });
    }, 1000);
  });
};

export const changePasswordAPI = async (passwordData) => {
  console.log('Changing password...');
  // return apiClient.post('/users/me/password', passwordData).then(response => response.data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (passwordData.currentPassword === "password") { // Dummy check
         resolve({ message: 'Password changed successfully' });
      } else {
         reject(new Error('Incorrect current password'));
      }
    }, 1000);
  });
};

export const validateToken = async (token) => {
    // return apiClient.post('/auth/validate-token').then(res => res.data.user);
    console.log('Validating token:', token);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (token === 'fake-jwt-token' || token === 'new-fake-jwt-token') {
                 // Simulate fetching user data based on token
                resolve({ id: 1, email: 'user@example.com', fullname: 'Иван Иванов', age: 30 });
            } else {
                reject(new Error('Invalid token'));
            }
        }, 300);
    });
};