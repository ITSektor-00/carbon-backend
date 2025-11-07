# Docker Setup - CARBON Backend

## 🐳 Docker Setup

Ovaj backend može se pokrenuti u Docker kontejneru.

---

## 📋 Preduslovi

- Docker instaliran na sistemu
- Docker Compose instaliran (obično dolazi sa Docker Desktop)

---

## 🚀 Brzo Pokretanje

### 1. Proveri `.env` fajl

Proveri da li imaš sve potrebne environment varijable u `.env` fajlu:

```env
MONGO_URL=mongodb+srv://devlukarakic:LukaATLAS00@cluster0.fu4cybs.mongodb.net/registracije?retryWrites=true&w=majority&appName=Cluster0
RESEND_API_KEY=re_hpCKYaLU_AFJvveHpTu3VSAGETXcf2rUV
EMAIL_FROM=onboarding@resend.dev
```

### 2. Build Docker Image

```bash
docker build -t carbon-backend .
```

### 3. Pokreni Container

```bash
docker run -d \
  --name carbon-backend \
  -p 5000:5000 \
  --env-file .env \
  carbon-backend
```

---

## 🎯 Korišćenje Docker Compose (Preporučeno)

### Struktura

Docker Compose pokreće:
- **backend** - Node.js API server (port 5000 - interno)
- **nginx** - Nginx reverse proxy (port 80 - javno dostupan)

### Pokretanje

```bash
# Build i pokreni
docker-compose up -d

# Pregled logova
docker-compose logs -f

# Logovi samo za backend
docker-compose logs -f backend

# Logovi samo za nginx
docker-compose logs -f nginx

# Zaustavi
docker-compose down
```

### Frontend Build

Pre pokretanja, uradi build frontend aplikacije:

```bash
# U frontend direktorijumu
npm run build

# Kopiraj build folder u backend direktorijum
cp -r dist ../carbon-mongoDB-project/frontend-build
```

**Napomena:** Nginx očekuje build folder na lokaciji `./frontend-build/`

### Komande

```bash
# Restart servisa
docker-compose restart

# Zaustavi servis
docker-compose stop

# Pokreni servis
docker-compose start

# Obriši container i image
docker-compose down --rmi all
```

---

## 🔍 Provera da li radi

```bash
# Proveri status
docker-compose ps

# Testiraj endpoint
curl http://localhost:5000/

# Proveri logove
docker-compose logs carbon-backend
```

---

## 📝 Environment Varijable

Docker Compose automatski čita `.env` fajl. Proveri da li su sve varijable postavljene:

- `MONGO_URL` - MongoDB connection string
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - Email adresa za slanje (onboarding@resend.dev za testiranje)

---

## 🛠️ Troubleshooting

### Container se ne pokreće

```bash
# Proveri logove
docker-compose logs

# Proveri da li je port zauzet
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac
```

### Promene u kodu

Nakon izmena u kodu, rebuild-uj image:

```bash
docker-compose up -d --build
```

### Baza podataka ne radi

Proveri da li je `MONGO_URL` ispravan i da li možeš da se povežeš sa MongoDB Atlas-om.

---

## 📦 Production Deployment

Za produkciju na Render ili drugim platformama:

1. **Build Docker image:**
   ```bash
   docker build -t carbon-backend .
   ```

2. **Push na Docker Hub:**
   ```bash
   docker tag carbon-backend yourusername/carbon-backend
   docker push yourusername/carbon-backend
   ```

3. **Na Render-u:**
   - Koristi Docker kao deployment tip
   - Postavi environment varijable u Render dashboard-u
   - Render će automatski pokrenuti Docker image

---

## 🔒 Security Notes

- `.env` fajl se ne kopira u Docker image (videti `.dockerignore`)
- Environment varijable se prosleđuju kroz `docker-compose.yml`
- Container koristi non-root korisnika za sigurnost

---

## 📊 Health Check

Docker automatski proverava health status:

```bash
# Proveri health status
docker inspect --format='{{.State.Health.Status}}' carbon-backend
```

---

## 🎯 Production Tips

1. **Koristi Docker secrets** za osetljive podatke
2. **Postavi restart policy** na `always`
3. **Koristi Docker volumes** za logove (ako je potrebno)
4. **Postavi resource limits** (CPU, memory)

---

## 📞 Support

Za dodatne informacije, pogledaj `BACKEND_SPECIFICATION.md`.

