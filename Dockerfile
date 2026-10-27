# syntax=docker/dockerfile:1

# ─── Dépendances ────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# postinstall (nuxt prepare) a besoin des sources : lancé plus tard
RUN npm ci --ignore-scripts

# ─── Développement (hot reload) ─────────────
FROM deps AS dev
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "npx nuxt prepare && npx nuxt dev --host 0.0.0.0"]

# ─── Build (SPA statique, ssr: false) ───────
FROM deps AS build
COPY . .
RUN npx nuxt prepare && npx nuxt generate

# ─── Production (nginx) ─────────────────────
FROM nginx:1.27-alpine AS prod
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
