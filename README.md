# Портфолио — Артём Ребриков · Backend Developer

Одностраничный сайт-визитка с рейв/дабстеп-эстетикой: реактивный canvas-фон,
кастомный курсор, GSAP scroll-эффекты, магнитные кнопки, 3D-tilt карточки и
кинематографичный morph-переход при открытии проекта (Framer Motion `layoutId`).

**Стек:** React 18 · TypeScript · Vite · Tailwind CSS v4 · GSAP (ScrollTrigger) ·
Framer Motion · Lenis (smooth scroll).

## Локальный запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # сборка в dist/
npm run preview    # предпросмотр прод-сборки
```

## Заменить фото

Положи своё фото в `public/me.jpg` (портретная ориентация, ~3:4, JPG).
Сейчас там временный аватар с GitHub.

## Деплой на GitHub Pages

1. Создай репозиторий на GitHub (напр. `portfolio`) и запушь код в ветку `main`.
2. В репозитории: **Settings → Pages → Source → GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` соберёт и опубликует сайт автоматически.
   - Для репозитория `portfolio` сайт будет на `https://<user>.github.io/portfolio/`
     (`VITE_BASE` подставляется автоматически из имени репозитория).
   - Если назвать репозиторий `<user>.github.io` — поменяй в workflow
     `VITE_BASE` на `"/"`, тогда сайт будет на корневом домене.

## Первый пуш

```bash
git init
git add -A
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/DoonyFreeman/portfolio.git
git push -u origin main
```
