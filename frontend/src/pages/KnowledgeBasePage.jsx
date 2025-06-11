import React, { useState, useEffect } from 'react';
import { getLinksAPI, addLinkAPI, deleteLinkAPI } from '../services/knowledgeBaseService';
import { Link } from 'react-router-dom';

function KnowledgeBasePage() {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchLinks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getLinksAPI();
      setLinks(data);
    } catch (err) {
      setError('Ошибка загрузки ссылок: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleInputChange = (e) => {
    setNewLink({ ...newLink, [e.target.name]: e.target.value });
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.url) {
        setError("URL обязателен для заполнения.");
        return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await addLinkAPI(newLink);
      setSuccessMessage('Ссылка успешно добавлена!');
      setNewLink({ url: '', title: '' }); // Clear form
      fetchLinks(); // Refresh list
    } catch (err) {
      setError('Ошибка добавления ссылки: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Placeholder for delete functionality
  const handleDeleteLink = async (linkId) => {
    if (window.confirm('Удалить эту ссылку?')) {
      setIsLoading(true);
      try {
        await deleteLinkAPI(linkId);
        fetchLinks();
      } catch (err) {
        setError('Ошибка удаления ссылки: ' + err.message);
      }
      setIsLoading(false);
    }
  };


  return (
    <div className="container">
      <h1>База знаний</h1>

      <section className="knowledge-base-section add-link-section card">
        <h2>Добавить новый ресурс</h2>
        <form id="add-link-form" onSubmit={handleAddLink}>
          <div className="form-group">
            <label htmlFor="link-url">URL Ссылки*</label>
            <input type="url" id="link-url" name="url" placeholder="https://example.com/article" value={newLink.url} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="link-title">Название / Описание</label>
            <input type="text" id="link-title" name="title" placeholder="Краткое описание ресурса" value={newLink.title} onChange={handleInputChange} />
          </div>
          {successMessage && <div className="success-message" style={{display: 'block'}}>{successMessage}</div>}
          {error && !successMessage && <div className="error-message" style={{display: 'block'}} id="add-link-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading && newLink.url ? 'Добавление...' : 'Добавить ссылку'}
          </button>
        </form>
      </section>

      <section className="knowledge-base-section link-list-section">
        <h2>Сохранённые ресурсы</h2>
        <button className="btn btn-secondary" onClick={fetchLinks} disabled={isLoading}>
          {isLoading && links.length === 0 ? 'Загрузка...' : 'Показать/Обновить список'}
        </button>

        <div className="knowledge-base-list" id="links-list-container" style={{ marginTop: '15px' }}>
          {isLoading && links.length === 0 && <p id="links-loading">Загрузка ссылок...</p>}
          {!isLoading && links.length === 0 && !error && <p id="links-empty">У вас пока нет сохраненных ссылок.</p>}
          {error && links.length === 0 && <div className="error-message" style={{ display: 'block' }}>{error}</div>}

          <ul className="styled-list">
            {links.map(link => (
              <li key={link.id}>
                <div>
                    <span className="link-title">{link.title || 'Без названия'}</span>
                    <span className="link-url">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url}
                        </a>
                    </span>
                </div>
                <button className="btn btn-danger btn-small" onClick={() => handleDeleteLink(link.id)} disabled={isLoading}>Удалить</button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="knowledge-base-section telegram-info">
        <h2>Telegram Бот</h2>
        <p>Вы также можете добавлять ссылки через нашего Telegram-бота. Отправьте боту ссылку, и в подписи к ней укажите описание.</p>
        <p>Наш бот: <a href="https://t.me/OrganizerBot" target="_blank" rel="noopener noreferrer" className="btn btn-link">@OrganizerBot</a></p>
        <p>Бот будет периодически присылать вам случайные ссылки из вашей базы для изучения данных ресурсов.</p>
        <p>Не забудьте привязать бота к вашему аккаунту в <Link to="/profile">профиле</Link>!</p>
      </section>
    </div>
  );
}

export default KnowledgeBasePage;