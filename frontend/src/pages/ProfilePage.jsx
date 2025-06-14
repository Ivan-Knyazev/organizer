// organizer/src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, updateUserProfileAPI, changePasswordAPI } from '../services/authService';

function ProfilePage() {
  const { user: authUser, updateUserProfile: updateAuthContextUser } = useAuth();
  
  // Состояние для данных профиля, загруженных с сервера (для сброса)
  const [serverProfile, setServerProfile] = useState({
    email: '',
    fullname: '',
    age: '',
    contacts: '',
    telegramHash: ''
  });

  // Состояние для редактируемых данных профиля в форме
  const [editableProfile, setEditableProfile] = useState({
    fullname: '',
    age: '',
    contacts: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const data = await fetchUserProfile();
      setServerProfile(data); // Сохраняем исходные данные с сервера
      setEditableProfile({ // Заполняем форму редактирования
        fullname: data.fullname || '',
        age: data.age !== null && data.age !== undefined ? String(data.age) : '', // Преобразуем в строку для input
        contacts: data.contacts || ''
      });
      if (authUser && data.email !== authUser.email) {
        updateAuthContextUser(data);
      }
    } catch (err) {
      setProfileError('Не удалось загрузить профиль: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingProfile(false);
    }
  }, [authUser, updateAuthContextUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdatingProfile(true);

    const dataToSend = {
      fullname: editableProfile.fullname,
      contacts: editableProfile.contacts,
    };

    // Обработка возраста
    if (editableProfile.age !== undefined && editableProfile.age !== null && editableProfile.age.trim() !== '') {
      const ageAsNumber = Number(editableProfile.age);
      if (isNaN(ageAsNumber) || ageAsNumber < 0) { // Проверка на отрицательный возраст
        setProfileError('Возраст должен быть корректным положительным числом.');
        setUpdatingProfile(false);
        return;
      }
      dataToSend.age = ageAsNumber;
    }

    console.log("Data being sent to backend for profile update:", dataToSend);

    try {
      const updatedProfileFromServer = await updateUserProfileAPI(dataToSend);
      setServerProfile(updatedProfileFromServer); // Обновляем "эталонные" данные
      setEditableProfile({ // Обновляем форму
        fullname: updatedProfileFromServer.fullname || '',
        age: updatedProfileFromServer.age !== null && updatedProfileFromServer.age !== undefined ? String(updatedProfileFromServer.age) : '',
        contacts: updatedProfileFromServer.contacts || ''
      });
      updateAuthContextUser(updatedProfileFromServer);
      setProfileSuccess('Профиль успешно обновлен!');
      setIsEditing(false);
    } catch (err) {
      setProfileError('Ошибка обновления профиля: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('Новые пароли не совпадают.');
      return;
    }
    if (passwordData.newPassword.length < 6) { // Пример минимальной длины пароля
        setPasswordError('Новый пароль должен быть не менее 6 символов.');
        return;
    }
    setChangingPassword(true);
    try {
      await changePasswordAPI({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Пароль успешно изменен!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordError('Ошибка смены пароля: ' + (err.response?.data?.error || err.message));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) { // Если нажимаем "Отмена"
      // Сбрасываем значения формы к исходным серверным данным
      setEditableProfile({
        fullname: serverProfile.fullname || '',
        age: serverProfile.age !== null && serverProfile.age !== undefined ? String(serverProfile.age) : '',
        contacts: serverProfile.contacts || ''
      });
      setProfileError(''); // Сбрасываем ошибки формы профиля
    }
    setIsEditing(!isEditing);
  };
  
  if (loadingProfile) return <div className="container"><p>Загрузка профиля...</p></div>;

  return (
    <div className="container">
      <h1>Профиль пользователя</h1>
      
      {/* Сообщения об успехе/ошибке для операций с профилем */}
      {profileError && !isEditing && <div className="error-message" style={{ display: 'block', marginBottom: '15px' }}>{profileError}</div>}
      {profileSuccess && !isEditing && <div className="success-message" style={{ display: 'block', marginBottom: '15px' }}>{profileSuccess}</div>}

      <section className="profile-section profile-avatar-section">
          <div className="avatar profile-avatar large-avatar">
              {/* TODO: Replace with actual avatar logic if user.avatarUrl is available */}
              {authUser?.avatarUrl ? <img src={authUser.avatarUrl} alt="Аватар" /> : <i className="fas fa-user" style={{fontSize: '3em'}}></i> }
          </div>
          <div className="profile-avatar-actions">
              <h3>{serverProfile.fullname || serverProfile.email}</h3>
              {/* TODO: Implement avatar change functionality */}
              <button className="btn btn-secondary btn-small" disabled>*Сменить аватар*</button>
          </div>
      </section>

      <section className="profile-section profile-info">
        <h2>Ваши данные</h2>
        {isEditing ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="profile-email">E-mail (логин):</label>
              <input type="email" id="profile-email" name="email" value={serverProfile.email} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="profile-fullname">ФИО:</label>
              <input type="text" id="profile-fullname" name="fullname" value={editableProfile.fullname} onChange={handleProfileInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-age">Возраст:</label>
              <input type="number" id="profile-age" name="age" value={editableProfile.age} onChange={handleProfileInputChange} min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="profile-contacts">Контактные данные:</label>
              <input type="text" id="profile-contacts" name="contacts" value={editableProfile.contacts} onChange={handleProfileInputChange} />
            </div>
            {profileError && isEditing && <div className="error-message" style={{ display: 'block' }}>{profileError}</div>}
            <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
              {updatingProfile ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleEditToggle} style={{marginLeft: '10px'}} disabled={updatingProfile}>
              Отмена
            </button>
          </form>
        ) : (
          <>
            <p><strong>E-mail (логин):</strong> {serverProfile.email}</p>
            <p><strong>ФИО:</strong> {serverProfile.fullname || 'Не указано'}</p>
            <p><strong>Возраст:</strong> {serverProfile.age !== null && serverProfile.age !== undefined ? serverProfile.age : 'Не указан'}</p>
            <p><strong>Контактные данные:</strong> {serverProfile.contacts || 'Не указаны'}</p>
            <button className="btn btn-secondary" onClick={handleEditToggle}>Редактировать данные</button>
          </>
        )}
      </section>

      <section className="profile-section telegram-integration">
        <h2>Интеграция с Telegram-ботом</h2>
        <p>Для привязки вашего Telegram аккаунта к сервису Organizer, отправьте следующую хеш-строку нашему боту <a href="https://t.me/YourOrganizerBot" target="_blank" rel="noopener noreferrer">@YourOrganizerBot</a>:</p>
        <p>Ваш уникальный код:</p>
        <div className="telegram-hash">{serverProfile.telegramHash || 'Будет доступен после настройки на сервере'}</div>
        <p><small>Этот код уникален и используется только для первоначальной привязки.</small></p>
        <p>После этого Вам станет доступна возможность добавления источников в Базу Знаний через Telegram бота, получение напоминаний, *а также вход через тг*.</p>
      </section>

      <section className="profile-section change-password">
        <h2>Смена пароля</h2>
        <form id="change-password-form" onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="current-password">Текущий пароль</label>
            <input type="password" id="current-password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">Новый пароль</label>
            <input type="password" id="new-password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} required minLength="6" />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">Подтвердите новый пароль</label>
            <input type="password" id="confirm-new-password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordInputChange} required minLength="6" />
          </div>
          {passwordError && <div className="error-message" id="password-change-error" style={{display: 'block'}}>{passwordError}</div>}
          {passwordSuccess && <div className="success-message" id="password-change-success" style={{display: 'block'}}>{passwordSuccess}</div>}
          <button type="submit" className="btn btn-primary" disabled={changingPassword}>
            {changingPassword ? 'Смена...' : 'Сменить пароль'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;