# 1. Korak: koristi Node.js LTS sliku
FROM node:20-alpine

# 2. Kreiraj radni direktorijum
WORKDIR /app

# 3. Kopiraj package.json i lock fajlove
COPY package.json package-lock.json* ./

# 4. Instaliraj zavisnosti
RUN npm install --only=production

# 5. Kopiraj ostatak koda
COPY . .

# 6. Kreiraj non-root korisnika za sigurnost
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 7. Pokreni server
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]