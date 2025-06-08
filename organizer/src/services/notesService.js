import apiClient from './api';

const mockNotes = [
  { id: 1, title: 'Сделать тесты по ИнфоБезу', content: 'Тест1, <strong>Тест2</strong>, <em>Тест4</em>.', date: '2025-04-01 10:30' },
  { id: 2, title: 'Идеи для органайзера', content: 'Идеи для проекта Organizer: добавить <strong>календарь</strong> и <em>напоминания</em>.', date: '2025-04-01 10:30' },
  { id: 3, title: 'Только заголовок', content: '', date: '2025-04-01 10:30' },
  { id: 4, title: '', content: 'Просто текстовая заметка без форматирования.', date: '2025-04-01 10:30' },
];
let nextNoteId = 5;

export const getNotesAPI = async (params = { limit: 10, offset: 0 }) => {
  console.log('Fetching notes with params:', params);
  // return apiClient.get('/notes', { params }).then(response => response.data);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate pagination: take a slice of mockNotes
      const notes = mockNotes.slice(params.offset, params.offset + params.limit);
      resolve({ notes, totalCount: mockNotes.length }); // Return notes and total count for pagination
    }, 500);
  });
};

export const getNoteByIdAPI = async (id) => {
  console.log('Fetching note by id:', id);
  // return apiClient.get(`/notes/${id}`).then(response => response.data);
   return new Promise((resolve, reject) => {
    setTimeout(() => {
      const note = mockNotes.find(n => n.id === parseInt(id));
      if (note) {
        resolve(note);
      } else {
        reject(new Error('Note not found'));
      }
    }, 300);
  });
};

export const createNoteAPI = async (noteData) => {
  console.log('Creating note:', noteData);
  // return apiClient.post('/notes', noteData).then(response => response.data);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newNote = { id: nextNoteId++, ...noteData, date: new Date().toISOString().slice(0, 16).replace('T', ' ') };
      mockNotes.unshift(newNote); // Add to the beginning
      resolve(newNote);
    }, 500);
  });
};

export const updateNoteAPI = async (id, noteData) => {
  console.log('Updating note:', id, noteData);
  // return apiClient.put(`/notes/${id}`, noteData).then(response => response.data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockNotes.findIndex(n => n.id === parseInt(id));
      if (index !== -1) {
        mockNotes[index] = { ...mockNotes[index], ...noteData };
        resolve(mockNotes[index]);
      } else {
        reject(new Error('Note not found for update'));
      }
    }, 500);
  });
};

export const deleteNoteAPI = async (id) => {
  console.log('Deleting note:', id);
  // return apiClient.delete(`/notes/${id}`).then(response => response.data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockNotes.findIndex(n => n.id === parseInt(id));
      if (index !== -1) {
        mockNotes.splice(index, 1);
        resolve({ message: 'Note deleted successfully' });
      } else {
        reject(new Error('Note not found for deletion'));
      }
    }, 500);
  });
};