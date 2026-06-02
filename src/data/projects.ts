export type Project = {
  id: string
  title: string
  subtitle: string
  year: string
  featured: boolean
  category: 'backend' | 'ml' | 'other'
  stack: string[]
  summary: string
  highlights: string[]
  url: string
  accent: string // hex для акцента карточки
}

/**
 * Курированные данные проектов на основе README репозиториев DoonyFreeman.
 * Порядок = порядок вывода. Featured показываются крупнее.
 */
export const projects: Project[] = [
  {
    id: 'backend-learning',
    title: 'Booking API',
    subtitle: 'Async-бэкенд бронирования отелей',
    year: '2026',
    featured: true,
    category: 'backend',
    stack: [
      'FastAPI',
      'SQLAlchemy 2.0',
      'asyncpg',
      'PostgreSQL',
      'Redis',
      'Celery',
      'Alembic',
      'Docker',
      'Nginx',
    ],
    summary:
      'Флагман-проект: промышленный async REST API системы бронирования. Полный стек async/await без блокировок event loop, чистая изоляция слоёв и инфраструктура за одну команду.',
    highlights: [
      'Слой Repository + DataMapper — ORM не протекает в бизнес-логику',
      'Кэш горячих эндпоинтов в Redis (fastapi-cache2, TTL)',
      'Тяжёлые операции в фоне через Celery Worker + Beat',
      'Alembic: 7 миграций от первой таблицы до M2M-связей',
      'JWT в HTTP-only cookie, bcrypt, схемы Request→Internal→Response',
      'Docker Compose: 6 сервисов (Postgres, Redis, Nginx с rate limit, Celery)',
      'Изолированные тесты на отдельной БД с моком кэша',
    ],
    url: 'https://github.com/DoonyFreeman/BackendLearning',
    accent: '#ff1f8f',
  },
  {
    id: 'redis-kafka',
    title: 'Online Shop API',
    subtitle: 'E-commerce с event-driven архитектурой',
    year: '2026',
    featured: true,
    category: 'backend',
    stack: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Redis', 'Kafka', 'Next.js'],
    summary:
      'Production-ready бэкенд интернет-магазина, демонстрирующий работу с Redis и Kafka: кеширование, rate limiting, событийная обработка через producer/consumer.',
    highlights: [
      'Redis: кеш, rate limiting, blacklist токенов, trending-товары',
      'Kafka: event-driven, паттерны producer/consumer',
      'Async SQLAlchemy 2.0 + Alembic-миграции',
      'JWT-аутентификация, bcrypt, Pydantic v2',
      'Фронтенд на Next.js 14 + TypeScript + shadcn/ui',
    ],
    url: 'https://github.com/DoonyFreeman/redis-kafka',
    accent: '#00f0ff',
  },
  {
    id: 'booking-cinema',
    title: 'Cinema Booking',
    subtitle: 'Бронирование залов кинотеатра',
    year: '2026',
    featured: true,
    category: 'backend',
    stack: ['FastAPI', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'],
    summary:
      'REST API для бронирования залов кинотеатра: управление залами, местами и временными слотами с email-уведомлениями через event-driven архитектуру.',
    highlights: [
      'Управление залами, местами и временными слотами',
      'Email-уведомления через события (Kafka)',
      'Redis для кеша, Postgres 16 как основное хранилище',
      'Запуск всего стека через docker-compose',
    ],
    url: 'https://github.com/DoonyFreeman/Booking_API_Service',
    accent: '#9d4bff',
  },
  {
    id: 'ws-messenger',
    title: 'Realtime Messenger',
    subtitle: 'Мессенджер на WebSocket',
    year: '2026',
    featured: false,
    category: 'backend',
    stack: ['FastAPI', 'Socket.IO', 'PostgreSQL', 'Redis', 'JWT'],
    summary:
      'Real-time мессенджер с presence-трекингом, индикатором набора и вложениями. Pub/Sub поверх Redis для масштабирования WebSocket-соединений.',
    highlights: [
      'python-socketio поверх FastAPI',
      'Онлайн-статус и «печатает…» через Redis',
      'Redis Pub/Sub для WebSocket-фанаута',
      'Хранилище и auth на PostgreSQL/Supabase',
    ],
    url: 'https://github.com/DoonyFreeman/WebSocket_Messenger',
    accent: '#b6ff2e',
  },
  {
    id: 'smart-supporter',
    title: 'Tech-Support Triager',
    subtitle: 'Авто-триаж тикетов поддержки',
    year: '2026',
    featured: false,
    category: 'backend',
    stack: ['FastAPI', 'Python'],
    summary:
      'FastAPI-приложение для автоматической обработки и маршрутизации тикетов техподдержки IT-продуктов.',
    highlights: [
      'Автоматическая классификация и маршрутизация тикетов',
      'Чистый async FastAPI-сервис',
    ],
    url: 'https://github.com/DoonyFreeman/Smart_supporter',
    accent: '#00f0ff',
  },
  {
    id: 'upscaler',
    title: 'Console Upscaler',
    subtitle: 'AI-апскейл фото на Apple Silicon',
    year: '2026',
    featured: false,
    category: 'ml',
    stack: ['Python', 'PyTorch', 'Real-ESRGAN', 'GFPGAN', 'PySide6', 'MPS'],
    summary:
      'Нативное macOS-приложение для апскейла фото 2x/4x на Real-ESRGAN с восстановлением лиц через GFPGAN. Drag-and-drop GUI + CLI, ускорение на Apple Silicon (MPS).',
    highlights: [
      'Real-ESRGAN для super-resolution 2x/4x',
      'GFPGAN для восстановления лиц',
      'GUI на PySide6/Qt + CLI-режим',
      'Ускорение на Apple Silicon через PyTorch MPS',
    ],
    url: 'https://github.com/DoonyFreeman/Console_upscaler',
    accent: '#9d4bff',
  },
  {
    id: 'car-detection',
    title: 'License Plate Recognition',
    subtitle: 'Распознавание автономеров с видео',
    year: '2026',
    featured: false,
    category: 'ml',
    stack: ['YOLO', 'EasyOCR', 'OpenCV', 'PyTorch'],
    summary:
      'Компьютерное зрение: детекция и распознавание автомобильных номеров на видео через YOLO + OCR с фильтрацией текста по форматам номерных знаков.',
    highlights: [
      'YOLO для детекции номерных знаков и символов',
      'EasyOCR для распознавания текста',
      'OpenCV для обработки видеопотока',
      'Фильтрация по форматам номеров',
    ],
    url: 'https://github.com/DoonyFreeman/Car_detection_YOLO',
    accent: '#ff1f8f',
  },
  {
    id: 'go-spring',
    title: 'Go & Spring Boot',
    subtitle: 'Бэкенд за пределами Python',
    year: '2025',
    featured: false,
    category: 'other',
    stack: ['Go', 'Java', 'Spring Boot'],
    summary:
      'Эксперименты с другими бэкенд-экосистемами: REST API на Go и блог-движок на Java Spring Boot — широта инженерного кругозора.',
    highlights: [
      'GoAPI — REST-сервис на Go',
      'Блог на Java Spring Boot',
      'Сравнение подходов и рантаймов',
    ],
    url: 'https://github.com/DoonyFreeman?tab=repositories',
    accent: '#b6ff2e',
  },
]
