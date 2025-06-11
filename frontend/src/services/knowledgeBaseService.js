import apiClient from './api'; // For real API calls

// let mockLinks = [
//   { id: 1, url: 'https://go.dev/blog/waza-talk', title: 'Полезная статья про Golang - Concurrency is not parallelism' },
//   { id: 2, url: 'https://react.dev/learn', title: 'Документация по React' },
// ];
// let nextLinkId = 3;

export const getLinksAPI = async () => {
  const response = await apiClient.get('/knowledge-links');
  return response.data;
  // return new Promise((resolve) => {
  //   setTimeout(() => resolve([...mockLinks]), 500);
  // });
};

export const addLinkAPI = async (linkData) => {
  const response = await apiClient.post('/knowledge-links', linkData);
  return response.data;
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     const newLink = { id: nextLinkId++, ...linkData };
  //     mockLinks.unshift(newLink);
  //     resolve(newLink);
  //   }, 300);
  // });
};

export const deleteLinkAPI = async (linkId) => {
  const response = await apiClient.delete(`/knowledge-links/${linkId}`);
  return response.data;
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     const initialLength = mockLinks.length;
  //     mockLinks = mockLinks.filter(link => link.id !== linkId);
  //     if (mockLinks.length < initialLength) {
  //       resolve({ message: 'Link deleted' });
  //     } else {
  //       reject(new Error('Link not found'));
  //     }
  //   }, 300);
  // });
};