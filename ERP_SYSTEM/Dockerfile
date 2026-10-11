# =============================================================
#  واجهة نظام إدارة الحسابات — صورة نشر الإنتاج
#  بناء (Node 22 / Vite) ثم تشغيل على Nginx مع proxy للـ API
#
#  ملاحظة: عنوان الـ API يُمرَّر كـ build ARG حتى يُدمج داخل
#  ملفات الـ build (Vite يضيف قيمة env في وقت البناء وليس التشغيل)
# =============================================================

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=/api/v1
ARG VITE_UPDATES_HUB_URL=/hubs/updates

ENV VITE_API_URL=$VITE_API_URL \
    VITE_UPDATES_HUB_URL=$VITE_UPDATES_HUB_URL

RUN npm run build

# ---------- مرحلة التشغيل (Nginx) ----------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]