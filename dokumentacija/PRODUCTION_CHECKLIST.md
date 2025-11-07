# Production Checklist - CARBON Backend

## ✅ Šta je SPREMNO za produkciju:

### 1. Backend Kod
- ✅ Express.js server
- ✅ MongoDB povezivanje
- ✅ API endpointi
- ✅ Email servis (Resend)
- ✅ Validacija podataka
- ✅ Error handling
- ✅ CORS omogućen

### 2. Docker Setup
- ✅ Dockerfile optimizovan
- ✅ docker-compose.yml konfigurisan
- ✅ Nginx reverse proxy
- ✅ Health checks
- ✅ Non-root korisnik (sigurnost)

### 3. Baza Podataka
- ✅ MongoDB Atlas (cloud)
- ✅ Connection string konfigurisan
- ✅ Baza: `registracije`
- ✅ Kolekcija: `garancije`

### 4. Email Servis
- ✅ Resend API integracija
- ✅ HTML email template
- ✅ Automatsko izračunavanje datuma isteka garancije
- ⚠️ **TREBA:** Verifikacija domena za produkciju

---

## ⚠️ Šta TREBA da se uradi za produkciju:

### 1. Resend Domain Verifikacija
- [ ] Verifikuj domen `smarttehnologysolution.co.rs` na Resend-u
- [ ] Dodaj DNS zapise (TXT) u DNS panel
- [ ] Ažuriraj `EMAIL_FROM` u `.env`:
  ```
  EMAIL_FROM=servis@smarttehnologysolution.co.rs
  ```

### 2. Environment Varijable
Proveri da su sve postavljene:
- [ ] `MONGO_URL` - MongoDB connection string
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `EMAIL_FROM` - Email adresa sa verifikovanog domena
- [ ] `CARBON_LOGO_URL` - (opciono) URL loga

### 3. Security
- [ ] Proveri da `.env` fajl nije commitovan u git
- [ ] Proveri da su sve lozinke i API key-evi sigurni
- [ ] Proveri CORS policy (trenutno omogućen za sve - možda treba ograničiti)

### 4. Frontend Build
- [ ] Build frontend aplikacije
- [ ] Kopiraj build u `frontend-build/` folder
- [ ] Proveri da frontend koristi pravi API URL

---

## 🖥️ Postavljanje na Lokalni Server

### Opcija 1: Docker (Preporučeno)

```bash
# 1. Kopiraj ceo projekat na server
scp -r carbon-mongoDB-project user@server:/path/to/

# 2. Na serveru, uđi u direktorijum
cd /path/to/carbon-mongoDB-project

# 3. Proveri .env fajl
nano .env  # ili vim .env

# 4. Build frontend (ako nije već build-ovan)
# U frontend projektu:
npm run build
cp -r dist ../carbon-mongoDB-project/frontend-build

# 5. Pokreni Docker
docker-compose up -d

# 6. Proveri da li radi
curl http://localhost/
curl http://localhost/api/garancije
```

### Opcija 2: Bez Docker (Direktno Node.js)

```bash
# 1. Instaliraj Node.js (v20 ili noviji)
node --version

# 2. Instaliraj zavisnosti
npm install

# 3. Proveri .env fajl
cat .env

# 4. Pokreni server
npm start
# ili
node server.js

# Server će raditi na http://localhost:5000
```

### Opcija 3: PM2 (Production Process Manager)

```bash
# 1. Instaliraj PM2
npm install -g pm2

# 2. Pokreni sa PM2
pm2 start server.js --name carbon-backend

# 3. Sačuvaj konfiguraciju
pm2 save
pm2 startup

# 4. Proveri status
pm2 status
pm2 logs carbon-backend
```

---

## 🔧 Konfiguracija za Lokalni Server

### 1. Firewall
```bash
# Otvori port 80 (Nginx) i 5000 (Backend, ako treba direktno)
sudo ufw allow 80
sudo ufw allow 5000
```

### 2. Nginx (ako ne koristiš Docker)
Ako pokrećeš bez Docker-a, možeš koristiti sistemski Nginx:

```nginx
# /etc/nginx/sites-available/carbon-backend
server {
    listen 80;
    server_name tvoj-server-ip ili domen;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /path/to/frontend-build;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Systemd Service (za Node.js bez Docker)

Kreiraj `/etc/systemd/system/carbon-backend.service`:

```ini
[Unit]
Description=CARBON Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/carbon-mongoDB-project
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Zatim:
```bash
sudo systemctl enable carbon-backend
sudo systemctl start carbon-backend
sudo systemctl status carbon-backend
```

---

## 📋 Provera Pre Deploy-a

- [ ] Testiraj sve API endpoint-e
- [ ] Proveri MongoDB konekciju
- [ ] Testiraj slanje emaila
- [ ] Proveri da frontend build radi
- [ ] Proveri logove za greške
- [ ] Proveri da su sve environment varijable postavljene

---

## 🚀 Deployment na Render/Heroku/AWS

### Render
1. Push kod na GitHub
2. Konektuj GitHub repo na Render
3. Postavi build command: `docker build -t carbon-backend .`
4. Postavi start command: `docker-compose up`
5. Dodaj environment varijable u Render dashboard

### Heroku
1. Instaliraj Heroku CLI
2. `heroku create carbon-backend`
3. `heroku config:set MONGO_URL=...`
4. `git push heroku main`

### AWS/DigitalOcean
- Koristi Docker Compose direktno
- Ili EC2/VM sa Node.js

---

## ✅ Finalna Provera

Pre nego što deploy-uješ na produkciju:

1. **Testiraj lokalno:**
   ```bash
   docker-compose up
   curl http://localhost/api/garancije
   ```

2. **Proveri environment varijable:**
   - MongoDB connection string
   - Resend API key
   - Email FROM adresa

3. **Proveri logove:**
   ```bash
   docker-compose logs -f
   ```

4. **Testiraj email:**
   - Pošalji test garanciju
   - Proveri da li email stiže

---

## 📞 Support

Za dodatne informacije, pogledaj `BACKEND_SPECIFICATION.md`.

