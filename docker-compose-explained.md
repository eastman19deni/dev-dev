# Docker Compose — Построчное объяснение

```yaml
version: "3.8"
```
**Версия формата** Compose-файла. 3.8 — последняя стабильная версия, поддерживает все современные функции.

---

```yaml
services:
```
**Начало блока сервисов** — здесь описываются все контейнеры приложения.

---

## Сервис `db` (PostgreSQL)

```yaml
  db:
```
Имя сервиса — `db` (можно обращаться по этому имени из других контейнеров).

```yaml
    image: postgres:14
```
Используется **готовый образ** PostgreSQL версии 14 из Docker Hub.

```yaml
    container_name: postgres_db
```
Фиксированное имя контейнера (без него Docker сгенерирует случайное, типа `happy_fermi`).

```yaml
    restart: always
```
Контейнер **всегда перезапускается** при падении или перезагрузке хоста.

```yaml
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
```
Переменные окружения для настройки БД:
- пользователь: `postgres`
- пароль: `postgres`
- имя базы данных: `postgres`

```yaml
    volumes:
      - postgres_data:/var/lib/postgresql/data
```
**Том** `postgres_data` монтируется в директорию внутри контейнера, где PostgreSQL хранит данные. Это обеспечивает сохранность данных при удалении контейнера.

```yaml
    networks:
      - backend
```
Контейнер подключён только к сети `backend` (виден только API-сервису).

---

## Сервис `api` (Backend)

```yaml
  api:
```
Имя сервиса — `api`.

```yaml
    build:
      context: ./backend
```
Вместо готового образа — **сборка из Dockerfile**, лежащего в `./backend`.

```yaml
    container_name: backend_api
```
Фиксированное имя контейнера — `backend_api`.

```yaml
    restart: always
```
Автоматический перезапуск при падении.

```yaml
    env_file:
      - ./backend/.env
```
Переменные окружения берутся из файла `./backend/.env` (удобно для хранения конфигов и секретов).

```yaml
    ports:
      - "8080:8080"
```
Проброс портов: `хост:контейнер`. Порт 8080 контейнера доступен на порту 8080 хоста.

```yaml
    networks:
      - frontend
      - backend
```
Подключён к **двум сетям** — может общаться и с nginx (frontend), и с БД (backend).

```yaml
    depends_on:
      - db
```
**Зависимость**: сервис `db` должен запуститься раньше `api`.

---

## Сервис `nginx` (Reverse Proxy)

```yaml
  nginx:
```
Имя сервиса — `nginx`.

```yaml
    build:
      context: ./nginx
```
Сборка из Dockerfile в `./nginx`.

```yaml
    container_name: nginx_proxy
```
Фиксированное имя контейнера — `nginx_proxy`.

```yaml
    restart: always
```
Автоматический перезапуск при падении.

```yaml
    ports:
      - "80:80"
```
Порт 80 контейнера доступен на порту 80 хоста (главная точка входа).

```yaml
    volumes:
      - ./nginx/dist:/public
```
**Bind mount**: директория `./nginx/dist` на хосте монтируется в `/public` внутри контейнера. Изменения на хосте сразу видны в контейнере (удобно для статики).

```yaml
    networks:
      - frontend
```
Подключён только к сети `frontend` (видит только API, не имеет доступа к БД).

---

## Тома и сети

```yaml
volumes:
  postgres_data:
```
Объявление **именованного тома** `postgres_data`. Docker сам создаст и будет управлять им (хранится в `/var/lib/docker/volumes/`).

```yaml
networks:
  frontend:
  backend:
```
Объявление **двух изолированных сетей**. Docker создаст их автоматически при запуске.

---

## Итоговая схема взаимодействия

```
Пользователь (порт 80)
       ↓
   [nginx] ← сеть: frontend
       ↓
   [api]  ← сеть: frontend + backend
       ↓
   [db]   ← сеть: backend
```
