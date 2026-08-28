FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY proto ./proto
COPY src ./src
COPY app.js swagger.js ./

ENV NODE_ENV=production
EXPOSE 5000

USER node
CMD ["npm", "start"]
