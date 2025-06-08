import React, { useState, useEffect } from 'react';
import { getNotesAPI, createNoteAPI, updateNoteAPI, deleteNoteAPI } from '../services/notesService';

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showEditor, setShowEditor] = useState(false);
  const [currentNote, setCurrentNote] = useState(null); // For editing
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const notesPerPage = 10; // For "Load More"
  const [offset, setOffset] = useState(0);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);


  const fetchNotes = async (loadMore = false) => {
    setIsLoading(true);
    setError('');
    try {
      const currentOffset = loadMore ? offset : 0;
      const data = await getNotesAPI({ limit: notesPerPage, offset: currentOffset });
      if (loadMore) {
        setNotes(prevNotes => [...prevNotes, ...data.notes]);
      } else {
        setNotes(data.notes);
      }
      setOffset(currentOffset + data.notes.length);
      setHasMoreNotes(data.notes.length === notesPerPage && (currentOffset + data.notes.length) < data.totalCount);
    } catch (err) {
      setError('Ошибка загрузки заметок: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch initial notes

  const handleCreateNew = () => {
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setShowEditor(true);
  };

  const handleEdit = (note) => {
    setCurrentNote(note);
    setNoteTitle(note.title || '');
    setNoteContent(note.content.replace(/<[^>]*>?/gm, '')); // Basic HTML strip for textarea
    setShowEditor(true);
  };

  const handleSaveNote = async () => {
    setIsLoading(true); // For save operation
    const noteData = { title: noteTitle, content: noteContent }; // In a real rich text editor, content would be HTML
    try {
      if (currentNote && currentNote.id) {
        await updateNoteAPI(currentNote.id, noteData);
      } else {
        await createNoteAPI(noteData);
      }
      setShowEditor(false);
      setCurrentNote(null);
      setOffset(0); // Reset offset to reload from the beginning
      fetchNotes(); // Refetch notes
    } catch (err) {
      setError('Ошибка сохранения заметки: ' + err.message);
    }
    setIsLoading(false);
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      setIsLoading(true);
      try {
        await deleteNoteAPI(noteId);
        setOffset(0);
        fetchNotes(); // Refetch notes
      } catch (err) {
        setError('Ошибка удаления заметки: ' + err.message);
      }
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="container">
      <h1>Заметки</h1>
      <div className="notes-actions">
        <button className="btn btn-primary" onClick={handleCreateNew} disabled={showEditor}>Создать новую заметку</button>
      </div>

      {showEditor && (
        <div className="note-editor card" id="note-editor-section">
          <h3>{currentNote ? 'Редактировать заметку' : 'Новая заметка'}</h3>
          <div className="form-group">
            <label htmlFor="note-title">Заголовок</label>
            <input 
              type="text" 
              id="note-title" 
              placeholder="Название заметки" 
              value={noteTitle} 
              onChange={(e) => setNoteTitle(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="note-content-area">Текст заметки</label>
            <div className="note-editor-toolbar">
              <button title="Жирный"><b>Ж</b></button>
              <button title="Курсив"><i>К</i></button>
              <button title="Подчеркнутый"><div className="highlight">Ч</div></button>
            </div>
            <textarea 
              id="note-content-area" 
              className="note-editor-content" 
              placeholder="Введите текст вашей заметки..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            ></textarea>
          </div>
          <button className="btn btn-success" onClick={handleSaveNote} disabled={isLoading}>Сохранить</button>
          <button className="btn btn-secondary" onClick={handleCancel}>Отмена</button>
        </div>
      )}

      {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
      
      <div id="notes-list" style={{marginTop: '20px'}}>
        {isLoading && notes.length === 0 && <p id="notes-loading">Загрузка заметок...</p>}
        {!isLoading && notes.length === 0 && !error && <p id="notes-empty">У вас пока нет заметок.</p>}
        
        {notes.map(note => (
          <div className="card note-item" key={note.id}>
            <div className="note-content">
              {note.title && <h3>{note.title}</h3>}
              <div dangerouslySetInnerHTML={{ __html: note.content || '' }} />
              <small>Дата: {note.date}</small>
            </div>
            <div className="note-actions">
              <button className="btn btn-primary btn-small" onClick={() => handleEdit(note)}>Редактировать</button>
              <button className="btn btn-danger btn-small" onClick={() => handleDelete(note.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
      {hasMoreNotes && !isLoading && (
        <button className="btn btn-link" onClick={() => fetchNotes(true)} style={{ marginTop: '15px' }}>Загрузить еще</button>
      )}
      {isLoading && notes.length > 0 && <p>Загрузка...</p>}
    </div>
  );
}

export default NotesPage;