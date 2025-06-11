import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container not-found-container">
      <h1>404</h1>
      <p>Упс! Страница, которую вы ищете, не найдена.</p>
      <p>Возможно, она была перемещена, удалена или вы просто ввели неправильный адрес.</p>
      <Link to="/" className="btn btn-primary">Вернуться на главную</Link>
    </div>
  );
}

export default NotFoundPage;