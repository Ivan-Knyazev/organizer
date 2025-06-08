import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, updateUserProfileAPI, changePasswordAPI } from '../services/authService';

function ProfilePage() {
  const { user: authUser, updateUserProfile: updateAuthContextUser } = useAuth(); // Get user from AuthContext
  const [profile, setProfile] = useState({
    email: '',
    fullname: '',
    age: '',
    contacts: '',
    telegramHash: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const data = await fetchUserProfile(); // Fetches based on token in localStorage
        setProfile(data);
        if (authUser && data.email !== authUser.email) {
            updateAuthContextUser(data);
        }
      } catch (err) {
        setProfileError('Не удалось загрузить профиль: ' + err.message);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [authUser, updateAuthContextUser]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    try {
      const updatedProfile = await updateUserProfileAPI(profile); // API call
      setProfile(updatedProfile); // Update local state with response
      updateAuthContextUser(updatedProfile); // Update auth context
      setProfileSuccess('Профиль успешно обновлен!');
      setIsEditing(false);
    } catch (err) {
      setProfileError('Ошибка обновления профиля: ' + err.message);
    }
  };

  const handlePasswordChange = (e) => {
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
    try {
      await changePasswordAPI({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Пароль успешно изменен!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear fields
    } catch (err) {
      setPasswordError('Ошибка смены пароля: ' + err.message);
    }
  };
  
  if (loadingProfile) return <div className="container"><p>Загрузка профиля...</p></div>;

  return (
    <div className="container">
      <h1>Профиль пользователя</h1>
      {profileError && <div className="error-message" style={{ display: 'block' }}>{profileError}</div>}
      {profileSuccess && <div className="success-message" style={{ display: 'block' }}>{profileSuccess}</div>}

      <section className="profile-section profile-avatar-section">
          <div className="avatar profile-avatar large-avatar">
              {/* Replace with actual avatar logic */}
              <i className="fas fa-user" style={{fontSize: '3em'}}></i> 
          </div>
          <div className="profile-avatar-actions">
              <h3>{profile.fullname}</h3>
              <button className="btn btn-secondary btn-small">Сменить аватар</button>
          </div>
      </section>

      <section className="profile-section profile-info">
        <h2>Ваши данные</h2>
        {isEditing ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>E-mail (логин):</label>
              <input type="email" name="email" value={profile.email} onChange={handleProfileChange} disabled /> {/* Email usually not editable or special process */}
            </div>
            <div className="form-group">
              <label>ФИО:</label>
              <input type="text" name="fullname" value={profile.fullname} onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label>Возраст:</label>
              <input type="number" name="age" value={profile.age} onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label>Контактные данные:</label>
              <input type="text" name="contacts" value={profile.contacts} onChange={handleProfileChange} />
            </div>
            <button type="submit" className="btn btn-primary">Сохранить</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); /* reset changes? */ }}>Отмена</button>
          </form>
        ) : (
          <>
            <p><strong>E-mail (логин):</strong> {profile.email}</p>
            <p><strong>ФИО:</strong> {profile.fullname}</p>
            <p><strong>Возраст:</strong> {profile.age}</p>
            <p><strong>Контактные данные:</strong> {profile.contacts}</p>
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Редактировать данные</button>
          </>
        )}
      </section>

      <section className="profile-section telegram-integration">
        <h2>Интеграция с Telegram-ботом</h2>
        <p>Для привязки вашего Telegram аккаунта к сервису Organizer, отправьте следующую хеш-строку нашему боту <a href="https://t.me/YourOrganizerBot" target="_blank" rel="noopener noreferrer">@YourOrganizerBot</a>:</p>
        <p>Ваш уникальный код:</p>
        <div className="telegram-hash">{profile.telegramHash || 'Загрузка...'}</div>
        <p><small>Этот код уникален и используется только для первоначальной привязки.</small></p>
        <p>После этого Вам станет доступна возможность добавления источников в Базу Знаний через Telegram бота, получение напоминаний, *а также вход через тг*</p>
      </section>

      <section className="profile-section change-password">
        <h2>Смена пароля</h2>
        <form id="change-password-form" onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="current-password">Текущий пароль</label>
            <input type="password" id="current-password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">Новый пароль</label>
            <input type="password" id="new-password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">Подтвердите новый пароль</label>
            <input type="password" id="confirm-new-password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} required />
          </div>
          {passwordError && <div className="error-message" id="password-change-error" style={{display: 'block'}}>{passwordError}</div>}
          {passwordSuccess && <div className="success-message" id="password-change-success" style={{display: 'block'}}>{passwordSuccess}</div>}
          <button type="submit" className="btn btn-primary">Сменить пароль</button>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;