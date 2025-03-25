# Organizer

## Описание проекта

<b>Organizer</b> - это проект, нацеленный на создание удобного многофункционального инструмента для управления личной эффективностью, который включает в себя различные модули, каждый из которых отвечает за определённый функционал.

Предполагается реализация следующих модулей функционала:

- <b>Заметки</b>, в которых можно будет добавить новую текстовую заметку, получить список имеющихся, отредактировать или удалить какую-то заметку. Также предполагается возможность выделения (полужирным, курсивом) частей текста с корректным отображением на стророне пользователя.
- <b>База Знаний</b> будет представлена для удобства в двух видах пользовательского интерфейса:
    1) В виде <i>страницы сайта</i>, где можно будет вставить в текстовое поле ссылку на какой-либо удалённый ресурс (например, статью на Хабре) и заголовок к ней. Также будет возможность посмотреть список всех сохранённых ссылок.
    2) В виде <i>telegram-бота</i>, который будет также интегрирован в сервис. Ему можно будет отправить ссылку с подписью к ней. Затем с заданной периодичностью данный бот будет отправлять нам в случайном порядке данные ссылки для изучения
    * Также можно будет ещё реализовать собственный сокращатель ссылок для более удобного их представления.
    * Данный функционал будет полезен, так как часто бывает, что мы находим какую-то хорошую статью, сохраняем её и забываем о ней, больше не возвращаясь, чтобы дочитать. Данный модуль поможет решить эту проблему.
- <b>Погода</b>, где можно будет получить краткую сводку об актуальной информации о погоде на сегодня в заданном регионе, а именно усреднённую температуру по всем сервисам. Данная информация будет подгружаться с различных источников (Yandex Погода, Google Погода, Gismeteo, Гидрометцентр России) для возможности сравнения данных о погоде.
- По-возможности можно будет добавить также <i>IoT-модуль</i>, <i>личный блог</i>, возможность использования собственного <i>файлового сервера</i> (например, S3 хранилища), а также собственную <i>страницу-портфолио</i>.

На главной странице SPA web-приложения будет краткая сводка по всем вышеописанным модулям, при нажатии на каждый из который можно будет перейти на его страницу.

Таким образом весь сервис будет представлять модульную систему с возможностью лёгкой интеграции новых составляющих частей.

## Техническое описание реализации

### Backend

<b>Backend</b> часть приложения будет написана на Golang, с применением web-фреймворка [gin](https://gin-gonic.com/). Выбран именно данный ЯП, так как он является статически типизированным, высокоскоростным, имеет хорошую поддержку многопоточности, хорошо подходит для разработки облачных приложений. Фреймворк gin является достаточно популярным, а также имеет широкую функциональность.

Каждая единица функциональности будет вынесена в отдельный микросервис для большей отказоустойчивости, лёгкости масштабирования и дальнейшей доработки. В качестве основной СУБД будет использоваться PostgreSQL как надёжное, современное и гибкое решение. Для интеграции с frontend-частью будет использоваться подход REST API.

Микросервисы, которые будут реализованы:
- <b>Сервис авторизации</b>, связанный с собственным инстансом БД PostgreSQL для хранения информации о пользователях. Будет реализована выдача JWT-токена аутентификации, проверка его на валидность. Взаимосвязь с другими сервисами будет осуществляться посредством вызова удалённых процедур по gRPC. В будущем предполагается создание системы подтверждения регистрации по E-mail посредством использования API SMTP-сервера.
- <b>Сервис заметок</b>, который будет поддерживать CRUD-операции над заметками и связан с отдельным инстансом БД PostgreSQL.
- <b>Сервис базы знаний</b>, который также будет поддерживать CRUD-операции над записями в базе знаний и связан с отдельным инстансом БД MongoDB. Также данный сервис будет иметь отельный модуль для управления через telegram-бота, в котором будет реализован планировщик, отправки сообщений с заданной периодичностью.
- <b>Сервис погоды</b>, который будет периодически парсить, либо получать по открытым API данные о погоде с указанных выше сервисов и хранить их во временной базе данных, например Redis.
* Также в планах на будущее реализовать <b>админ-панель</b> для возможности редактирования базы пользователей и в целом контроля над системой.

### Frontend

<b>Frontend</b> часть приложения будет написана с применением основного WEB-стека (HTML, CSS, JS), а также фреймворка React. Выбран именно данный фреймворк, так как он является достаточно популярным, имеет широкую функциональность, а также будет изучаться нами на курсе "Клиент-серверных приложений".

Планируется реализовать следующие экраны:
- <b>Главный</b> экран с краткой сводкой по всем модулям приложения, при нажатии на каждый из который можно будет перейти на его страницу. Неавторизованному пользователю будет доступна только информация о погодев выбранном городе. Авторизованный же пользователь получит полную сводку.
- Экран <b>авторизации/регистрации</b>, на котором будут поля для ввода авторизационных данных (логин, пароль), а также при регистрации возможность указания доп. сведений о себе (ФИО, возраст, контактные данные).
- Экран <b>профиля пользователя</b>, на котором будет выводиться вся информация, имеющаяся о нём (E-mail, ФИО, возраст, контактные данные), а также будет доступна смена пароля. Кроме того, будет отображаться хеш-строка, которую нужно будет отправить telegram-боту для его привязки к ЛК пользователя.
- Экран с <b>погодой</b>, на котором будет поле для выбор города из списка и получение информации о погоде в нём на сегодня изо всех вышеперечисленных источников.
- Экран с <b>заметками</b> с последними 10 заметками пользователя. Можно будет нажать на соответствующую заметку, получить подробную информацию по ней, а также изменить или удлить её. Также будет кнопка для создания новой заметки или выгрузки всех заметок за определённый период.
- Экран с <b>базой знаний</b> будет иметь возможност добавить новую ссылку в базу знаний, а также подпись к ней. По нажатию на соответствующую кнопку можно будет получить полный список записей из БД. Также будет ссылка на telegram-бота.

<hr>

Данное приложение задумано для помощи в повседневной жизни, потребность в котором есть у меня самого. Реализация в виде модулей задумана для возможности лёгкого внедрения необходимого функционала, а также для получения опыта в разработке backend-части сервиса с применением микросервисной архитектуры.
