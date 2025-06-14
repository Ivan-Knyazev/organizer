# Organizer - Backend

Это бэкенд-часть приложения Organizer, написанная на Go с использованием фреймворка Gin и базы данных PostgreSQL.

## Стек технологий

- **Язык:** Go
- **Фреймворк:** Gin
- **База данных:** PostgreSQL
- **ORM:** GORM
- **Аутентификация:** JWT
- **API Документация:** Swagger (OpenAPI) через `swag` и `gin-swagger`
- **Контейнеризация БД:** Docker, Docker Compose

## Предварительные требования

- Установленный [Go](https://golang.org/dl/) (версия 1.18 или выше рекомендуется).
- Установленный [Docker](https://www.docker.com/get-started).
- Установленный [Docker Compose](https://docs.docker.com/compose/install/).
- (Опционально, для генерации Swagger) Установленный `swag` CLI: `go install github.com/swaggo/swag/cmd/swag@latest`. Убедитесь, что `$GOPATH/bin` или `$GOBIN` (или `$HOME/go/bin` для Go Modules по умолчанию) добавлен в `PATH`.

## Настройка и запуск

1.  **Клонируйте репозиторий (если вы этого еще не сделали) и перейдите в директорию бэкенда:**
    ```bash
    # git clone <url-репозитория>
    cd <путь-к-проекту>/backend
    ```

2.  **Создайте файл конфигурации окружения `.env`:**
    В корне директории `backend` создайте файл `.env`, аналогичный `.env.example`, заменив значения на свои.
    
    **ВАЖНО:** `JWT_SECRET` должен быть сложным и уникальным. Ключи API погоды необходимо получить на соответствующих сервисах (OpenWeatherMap, WeatherAPI.com).

3.  **Запустите базу данных PostgreSQL с помощью Docker Compose:**
    ```bash
    docker-compose up -d db
    ```
    Эта команда запустит контейнер с PostgreSQL в фоновом режиме. Для остановки: `docker-compose down`.

4.  **Установите зависимости Go:**
    ```bash
    go mod tidy
    ```

5.  **(Опционально) Сгенерируйте/обновите Swagger документацию:**
    Если вы вносили изменения в аннотации API или хотите сгенерировать документацию в первый раз:
    ```bash
    swag init
    ```

6.  **Запустите Backend-сервер:**
    ```bash
    go run main.go
    ```
    Сервер должен запуститься на порту, указанном в `API_PORT` (по умолчанию `8080`). Swagger UI будет доступен по адресу `http://<API_HOST>:<API_PORT>/swagger/index.html`.

## Структура директорий

- `config/`: Конфигурация приложения, подключение к БД.
- `handlers/`: Обработчики HTTP-запросов (контроллеры).
- `middleware/`: Middleware для Gin (например, аутентификация).
- `models/`: Структуры данных (модели GORM, DTO).
- `routes/`: Определение маршрутов API.
- `utils/`: Вспомогательные функции (хеширование, JWT).
- `docs/`: Автоматически генерируемая Swagger документация.
- `main.go`: Точка входа в приложение.
- `go.mod`, `go.sum`: Файлы управления зависимостями Go.
- `docker-compose.yml`: Конфигурация для Docker Compose (база данных).

## Доступные API эндпоинты

Подробное описание всех эндпоинтов доступно через Swagger UI по адресу:
`http://localhost:8080/swagger/index.html` (после запуска сервера и генерации `swag init`).

Основные группы:
- `/api/auth/*`
- `/api/users/*`
- `/api/notes/*`
- `/api/knowledge-links/*`
- `/api/weather`