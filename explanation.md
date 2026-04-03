# Лабораторная работа №4 — Полное объяснение проекта

## Содержание

1. [Общая архитектура](#1-общая-архитектура)
2. [Сервисы и их роль](#2-сервисы-и-их-роль)
3. [Docker Compose — построчный разбор](#3-docker-compose--построчный-разбор)
4. [Backend (FastAPI)](#4-backend-fastapi)
5. [База данных (PostgreSQL)](#5-база-данных-postgresql)
6. [Nginx (Reverse Proxy)](#6-nginx-reverse-proxy)
7. [Сети и изоляция](#7-сети-и-изоляция)
8. [Тома и персистентность](#8-тома-и-персистентность)
9. [Dockerfile'ы](#9-dockerfileы)
10. [Переменные окружения](#10-переменные-окружения)
11. [API Endpoints](#11-api-endpoints)
12. [Возможные вопросы на защите](#12-возможные-вопросы-на-защите)

---

## 1. Общая архитектура

Проект представляет собой **трёхуровневую архитектуру** (3-tier), развёрнутую через Docker Compose:

```
Пользователь (браузер)
        ↓ порт 80
    ┌─────────┐
    │  nginx  │  ← Reverse Proxy + раздача статики (React SPA)
    └────┬────┘
         ↓ сеть: frontend (проксирует /api/v1 → http://api:8080)
    ┌─────────┐
    │   api   │  ← FastAPI (Python 3.10), REST CRUD для User
    └────┬────┘
         ↓ сеть: backend (SQLAlchemy → postgresql://db:5432)
    ┌─────────┐
    │   db    │  ← PostgreSQL 14, хранение данных
    └─────────┘
```

**Ключевые технологии:**
- **Frontend:** React 19 (Vite build), статические файлы
- **Backend:** FastAPI + SQLAlchemy + Pydantic
- **База данных:** PostgreSQL 14
- **Прокси:** Nginx 1.23.3 (собирается из исходников)
- **Оркестрация:** Docker Compose v3.8

---

## 2. Сервисы и их роль

### Сервис `db`
- **Образ:** `postgres:14` (готовый образ из Docker Hub)
- **Роль:** Хранение данных пользователей
- **Особенности:** именованный том для персистентности, изоляция в сети `backend`

### Сервис `api`
- **Сборка:** из `./backend/Dockerfile`
- **Роль:** REST API с CRUD-операциями для модели `User`
- **Особенности:** подключён к двум сетям, зависит от `db`, конфиг через `.env`

### Сервис `nginx`
- **Сборка:** из `./nginx/Dockerfile`
- **Роль:** Reverse proxy + раздача фронтенда
- **Особенности:** bind mount для `dist/`, собирает nginx из исходников

---

## 3. Docker Compose — построчный разбор

```yaml
version: "3.8"
```
Версия синтаксиса Compose-файла. 3.8 поддерживает все современные функции.

```yaml
services:
```
Начало блока сервисов — описываются все контейнеры.

---

### Сервис `db`

```yaml
  db:
```
Имя сервиса. Другие контейнеры могут обращаться к нему по имени `db`.

```yaml
    image: postgres:14
```
Используется **готовый образ** PostgreSQL 14 из Docker Hub (не собирается вручную).

```yaml
    container_name: postgres_db
```
Фиксированное имя контейнера. Без этой строки Docker сгенерирует случайное имя.

```yaml
    restart: always
```
Политика перезапуска: контейнер автоматически перезапускается при падении или перезагрузке хоста.

```yaml
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
```
Переменные окружения для инициализации PostgreSQL:
- `POSTGRES_USER` — имя пользователя БД
- `POSTGRES_PASSWORD` — пароль
- `POSTGRES_DB` — имя создаваемой базы данных

```yaml
    volumes:
      - postgres_data:/var/lib/postgresql/data
```
**Именованный том** `postgres_data` монтируется в директорию, где PostgreSQL хранит данные. При удалении контейнера данные сохраняются.

```yaml
    networks:
      - backend
```
Подключён только к сети `backend` — виден только сервису `api`.

---

### Сервис `api`

```yaml
  api:
```
Имя сервиса.

```yaml
    build:
      context: ./backend
```
Вместо готового образа — **сборка из Dockerfile** в директории `./backend`.

```yaml
    container_name: backend_api
```
Фиксированное имя контейнера.

```yaml
    restart: always
```
Автоматический перезапуск при падении.

```yaml
    env_file:
      - ./backend/.env
```
Переменные окружения загружаются из файла `./backend/.env`.

```yaml
    ports:
      - "8080:8080"
```
Проброс портов: `хост:контейнер`. Порт 8080 контейнера доступен на хосте.

```yaml
    networks:
      - frontend
      - backend
```
Подключён к **двум сетям** — выступает мостом между frontend и backend.

```yaml
    depends_on:
      - db
```
**Зависимость:** сервис `db` запускается раньше `api`.

---

### Сервис `nginx`

```yaml
  nginx:
```
Имя сервиса.

```yaml
    build:
      context: ./nginx
```
Сборка из Dockerfile в `./nginx`.

```yaml
    container_name: nginx_proxy
```
Фиксированное имя контейнера.

```yaml
    restart: always
```
Автоматический перезапуск.

```yaml
    ports:
      - "80:80"
```
Порт 80 — главная точка входа для пользователя.

```yaml
    volumes:
      - ./nginx/dist:/public
```
**Bind mount:** локальная директория `./nginx/dist` монтируется в `/public` контейнера. Изменения на хосте сразу видны.

```yaml
    networks:
      - frontend
```
Только сеть `frontend` — nginx не имеет прямого доступа к БД.

---

### Тома и сети

```yaml
volumes:
  postgres_data:
```
Объявление именованного тома. Docker управляет им самостоятельно (хранится в `/var/lib/docker/volumes/`).

```yaml
networks:
  frontend:
  backend:
```
Объявление двух изолированных bridge-сетей.

---

## 4. Backend (FastAPI)

### Структура

```
backend/
├── Dockerfile          # Образ Python 3.10 + зависимости
├── requirements.txt    # Зависимости: fastapi, sqlalchemy, psycopg2, uvicorn...
├── .env                # Переменные окружения
└── src/
    ├── main.py         # Точка входа: FastAPI app + uvicorn
    ├── settings.py     # Pydantic Settings (валидация env-переменных)
    ├── db/
    │   ├── __init__.py
    │   ├── session.py  # SQLAlchemy engine + context manager Database
    │   └── initdb.py   # Создание таблиц при запуске
    ├── models/
    │   ├── __init__.py
    │   ├── base.py     # SQLAlchemy declarative_base
    │   └── user.py     # Модель User (id, name, age, male)
    ├── routers/
    │   ├── __init__.py # Роутер /api/v1/users
    │   └── user.py     # CRUD endpoints
    └── schemas/
        ├── __init__.py
        └── user.py     # Pydantic модели для запросов/ответов
```

### main.py
```python
app = FastAPI(debug=False)
app.include_router(router=router)
```
Создаёт FastAPI приложение, подключает роутеры. При запуске вызывает `initdb()` для создания таблиц.

### settings.py
Использует **pydantic-settings** для валидации переменных окружения. Если обязательные переменые (`DB_ADDR`, `DB_USER` и т.д.) не заданы — приложение не запустится.

### db/session.py
- Создаёт SQLAlchemy engine с connection string: `postgresql://user:pass@host:port/dbname`
- Класс `Database` — context manager (`with Database() as db:`), автоматический commit/rollback/close.

### models/user.py
Модель пользователя:
```python
class User(Base):
    __tablename__ = "user"
    id: int (PK, autoincrement)
    name: str (not null)
    age: int (not null)
    male: bool (not null, default=True)
```

### schemas/user.py
Pydantic схемы:
- `CreateUser` — для создания (name, age, male)
- `UserInfo` — для чтения (id, name, age, male)
- `UpdateUser` — для обновления (все поля Optional)

---

## 5. База данных (PostgreSQL)

### Почему PostgreSQL?
- Надёжная ACID-совместимая СУБД
- Отличная поддержка в SQLAlchemy
- Официальный образ с автоматической инициализацией через env-переменные

### Инициализация БД
При первом запуске PostgreSQL автоматически:
1. Создаёт пользователя `postgres` с паролем `postgres`
2. Создаёт базу данных `postgres`
3. Инициализирует системные таблицы

### Создание таблиц
`initdb()` в `main.py` вызывает `Base.metadata.create_all(engine)` — SQLAlchemy создаёт все таблицы, определённые в моделях.

---

## 6. Nginx (Reverse Proxy)

### nginx.conf

```nginx
user nginx;
daemon off;          # Не уходит в фон (нужно для Docker)
worker_processes auto;
```

```nginx
server {
    listen 80;
    root /public;

    location / {
        index index.html;
        try_files $uri /index.html =404;
    }
```
**Раздача статики:** все запросы к `/` отдают файлы из `/public`. `try_files` обеспечивает работу SPA — любой маршрут отдаёт `index.html`.

```nginx
    location /api/v1 {
        proxy_pass http://api:8080;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
**Reverse proxy:** все запросы к `/api/v1` перенаправляются на backend `api:8080`.

### Почему nginx собирается из исходников?
Dockerfile устанавливает nginx 1.23.3 из исходников с минимальным набором модулей:
- Отключены ненужные модули (auth_basic, autoindex, fastcgi, memcached и т.д.)
- Включены только SSL и HTTP/2
- Это уменьшает размер образа и атакуемую поверхность

### Multi-stage build
```dockerfile
FROM alpine:3 as nginxbuild   # Stage 1: компиляция
FROM alpine:3                  # Stage 2: минимальный образ только с бинарником
```
Первый этап компилирует nginx, второй — содержит только готовый бинарник.

---

## 7. Сети и изоляция

### Схема сетей

```
┌─────────────────────────────────────────┐
│              network: frontend           │
│                                         │
│   nginx  ←→  api                        │
│                                         │
│              network: backend            │
│                                         │
│              api  ←→  db                │
└─────────────────────────────────────────┘
```

### Почему две сети?
| Причина | Объяснение |
|---------|-----------|
| **Безопасность** | nginx не может напрямую обратиться к БД |
| **Минимизация атаки** | Каждый сервис видит только нужные ему сервисы |
| **Best Practice** | Принцип наименьших привилегий |

### Как api общается с db?
API использует `DB_ADDR=db` — Docker DNS разрешает имя `db` в IP контейнера PostgreSQL внутри сети `backend`.

---

## 8. Тома и персистентность

### Именованный том `postgres_data`
- Управляется Docker
- Хранится в `/var/lib/docker/volumes/`
- Переживает удаление контейнера
- Автоматически создаётся при `docker-compose up`

### Bind mount `./nginx/dist:/public`
- Прямое монтирование хост-директории
- Удобно для разработки: пересобрал фронтенд → nginx сразу отдаёт новые файлы
- Не требует пересборки образа

### Разница
| | Именованный том | Bind mount |
|---|---|---|
| Управление | Docker | Пользователь |
| Переносимость | Высокая | Зависит от хоста |
| Скорость | Высокая | Зависит от ФС |

---

## 9. Dockerfile'ы

### backend/Dockerfile

```dockerfile
FROM python:3.10
COPY requirements.txt .
RUN pip install -r requirements.txt && rm requirements.txt
WORKDIR /app
COPY src .
CMD ["python", "main.py"]
```

**Пошагово:**
1. Базовый образ Python 3.10
2. Копирует `requirements.txt`
3. Устанавливает зависимости и удаляет файл (уменьшает размер слоя)
4. Устанавливает рабочую директорию `/app`
5. Копирует исходный код
6. Запускает `main.py`

**Почему не `COPY . .`?**
Отдельное копирование `requirements.txt` позволяет Docker'у кэшировать слой с зависимостями. Если код изменился, но зависимости нет — `pip install` не перезапускается.

### nginx/Dockerfile

```dockerfile
FROM alpine:3 as nginxbuild
# Установка зависимостей + скачивание исходников nginx
RUN apk update && apk upgrade && ...
RUN ./configure --prefix=/nginx ... && make && make install

FROM alpine:3
# Минимальный образ только с nginx
COPY --from=nginxbuild /nginx /nginx
COPY nginx.conf /nginx/conf/nginx.conf
CMD ["./nginx/sbin/nginx"]
```

**Ключевые моменты:**
- Alpine — минимальный образ (~5MB)
- Multi-stage build — компиляция в одном образе, запуск в другом
- Отключены ненужные модули для безопасности
- `daemon off` — nginx работает в foreground (нужно для Docker)

---

## 10. Переменные окружения

### backend/.env

```
SERVER_ADDR=0.0.0.0
SERVER_PORT=8080

DB_ADDR=db          # Имя сервиса в docker-compose
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
```

### Важные моменты
| Переменная | Зачем | Что если изменить |
|---|---|---|
| `DB_ADDR` | Адрес БД в Docker DNS | Должен совпадать с именем сервиса |
| `DB_USER` | Пользователь БД | Должен совпадать с `POSTGRES_USER` |
| `DB_PASSWORD` | Пароль БД | Должен совпадать с `POSTGRES_PASSWORD` |
| `DB_NAME` | Имя БД | Должен совпадать с `POSTGRES_DB` |

### Почему `.env` в `.gitignore`?
Файл `.env` содержит секреты (пароли). В репозитории хранится только `.env.example` с шаблоном.

---

## 11. API Endpoints

### `GET /api/v1/users/{user_id}`
Возвращает пользователя по ID.
- **200:** `UserInfo { id, name, age, male }`
- **404:** `"User not found"`

### `GET /api/v1/users/`
Возвращает всех пользователей.
- **200:** `List[UserInfo]`

### `POST /api/v1/users/`
Создаёт пользователя.
- **Тело:** `CreateUser { name, age, male? }`
- **201:** `int` (ID созданного пользователя)

### `PUT /api/v1/users/{user_id}`
Обновляет пользователя.
- **Тело:** `UpdateUser { name?, age?, male? }`
- **204:** No Content
- **404:** `"User not found"`

### `DELETE /api/v1/users?user_id={user_id}`
Удаляет пользователя.
- **204:** No Content
- **404:** `"User not found"`

---

## 12. Возможные вопросы на защите

### Docker Compose

**Q: Что делает `docker-compose up`?**
A: Создаёт и запускает все сервисы: создаёт сети, тома, собирает образы, запускает контейнеры в правильном порядке (с учётом `depends_on`).

**Q: Чем `docker-compose up` отличается от `docker-compose up -d`?**
A: `-d` (detached) запускает контейнеры в фоновом режиме. Без флага логи выводятся в терминал.

**Q: Что делает `docker-compose down`?**
A: Останавливает и удаляет все контейнеры, сети. Тома удаляются только с флагом `--volumes`.

**Q: Зачем нужен `depends_on`?**
A: Гарантирует порядок запуска: `db` стартует раньше `api`. **Важно:** `depends_on` не ждёт готовности БД, только запуска контейнера.

**Q: Чем `image` отличается от `build`?**
A: `image` — использует готовый образ из реестра. `build` — собирает образ из Dockerfile.

**Q: Что такое `restart: always`?**
A: Политика перезапуска. Контейнер перезапускается всегда, даже после ручной остановки (в отличие от `unless-stopped`).

**Q: Чем именованный том отличается от bind mount?**
A: Именованный том управляется Docker (`/var/lib/docker/volumes/`), bind mount — прямая ссылка на хост-путь.

### Сети

**Q: Почему nginx не может обратиться к БД напрямую?**
A: nginx подключён только к `frontend`, а БД — только к `backend`. У nginx нет интерфейса в `backend` сети.

**Q: Как контейнеры разрешают имена друг друга?**
A: Docker создаёт встроенный DNS-сервер. В сети `backend` имя `db` разрешается в IP контейнера PostgreSQL.

**Q: Что будет если убрать сеть `backend`?**
A: API не сможет подключиться к БД — `DB_ADDR=db` не разрешится.

### Backend

**Q: Почему используется `pydantic-settings`?**
A: Для автоматической валидации и приведения типов переменных окружения. Если обязательная переменная не задана — приложение упадёт с понятной ошибкой.

**Q: Зачем нужен `initdb()`?**
A: Вызывает `Base.metadata.create_all(engine)` — создаёт все таблицы в БД на основе моделей SQLAlchemy.

**Q: Что делает context manager `Database`?**
A: Создаёт сессию, при выходе делает commit (если не было ошибки) или rollback, закрывает сессию.

**Q: Почему `CMD ["python", "main.py"]` а не `uvicorn main:app`?**
A: В `main.py` есть блок `if __name__ == "__main__"`, который вызывает `uvicorn.run()`. Это эквивалентно.

**Q: Зачем отдельное копирование `requirements.txt` в Dockerfile?**
A: Docker кэширует слои. Если зависимости не изменились, `pip install` не перезапускается при изменении кода.

### Nginx

**Q: Что делает `try_files $uri /index.html =404`?**
A: Пробует отдать файл по URI. Если нет — отдаёт `index.html` (SPA fallback). Если и его нет — 404.

**Q: Зачем `proxy_set_header`?**
A: Передаёт оригинальные заголовки backend'у: реальный хост, IP клиента, протокол.

**Q: Почему `daemon off`?**
A: Docker ожидает, что основной процесс работает в foreground. Если nginx уйдёт в фон, контейнер завершится.

**Q: Зачем multi-stage build?**
A: Первый этап компилирует nginx (нужны компиляторы, заголовки). Второй содержит только бинарник — образ намного меньше.

### База данных

**Q: Что будет с данными при `docker-compose down`?**
A: Данные сохранятся в томе `postgres_data`. При `docker-compose down --volumes` — удалятся.

**Q: Зачем `POSTGRES_USER/PASSWORD/DB`?**
A: Официальный образ PostgreSQL при первом запуске читает эти переменные и создаёт пользователя и БД.

**Q: Что будет если изменить `POSTGRES_PASSWORD` после первого запуска?**
A: Ничего — пароль уже установлен в БД. Новые переменные применяются только при инициализации пустого тома.

### Общее

**Q: Как проверить, что сервисы работают?**
A: `docker-compose ps` — показывает статус контейнеров. `docker-compose logs` — логи.

**Q: Как подключиться к БД из хоста?**
A: Через проброшенный порт (если проброшен) или `docker exec -it postgres_db psql -U postgres`.

**Q: Что такое Docker DNS?**
A: Встроенный DNS-сервер Docker. В одной сети контейнеры могут обращаться друг к другу по имени сервиса.

**Q: Как масштабировать сервис `api`?**
A: `docker-compose up -d --scale api=3`. Но nginx нужно настроить upstream для балансировки.

**Q: Почему не `docker run` для каждого сервиса?**
A: Compose автоматизирует создание сетей, томов, зависимостей. С `docker run` всё нужно делать вручную.

**Q: Где хранятся данные томов?**
A: В `/var/lib/docker/volumes/<volume_name>/_data` на хосте Docker (или в VM для Docker Desktop).

**Q: Что будет если удалить контейнер `api`?**
A: Он пересоздастся при `docker-compose up`. Данные БД не пострадают (они в томе).

**Q: Как обновить версию PostgreSQL?**
A: Изменить `image: postgres:14` на `postgres:15` и сделать `docker-compose up -d`. Данные сохранятся в томе.

**Q: Чем `environment` отличается от `env_file`?**
A: `environment` задаёт переменные напрямую в YAML. `env_file` загружает из внешнего файла. `env_file` удобнее для секретов — файл можно не коммитить.
