# Deployment na Lokalni Server sa Javnim Domenom

## 🌐 Scenario

- **Javni domen:** `carbon.co.rs`
- **Lokalni server:** Server u firmi
- **Frontend + Backend:** Oba na istom serveru

---

## ✅ Da, može da radi na javnom domenu!

Backend je potpuno spreman za javni domen. Evo kako:

---

## 📋 Šta Treba Uraditi

### 1. DNS Konfiguracija (Extreme Pro Hosting)

**Važno:** Domen `carbon.co.rs` je zakupljen kod **Extreme Pro Hosting-a**, ne na serveru firme.

**Ko treba da uradi:**
- Neko ko ima pristup **Extreme Pro Hosting panelu** (ne Vlade - on upravlja samo serverom)

**Šta treba da se uradi:**

1. **Uloguj se u Extreme Pro Hosting panel**
2. **Idi na DNS Management** za domen `carbon.co.rs`
3. **Dodaj/izmeni A zapise:**

```
Type: A
Name: @ (ili prazno)
Value: [JAVNA IP adresa lokalnog servera firme]

Type: A
Name: www
Value: [JAVNA IP adresa lokalnog servera firme]
```

**Primer:**
```
A    @    185.123.45.67    (JAVNA IP servera, ne lokalna!)
A    www  185.123.45.67
```

**Važno:** 
- Koristi **JAVNU IP adresu** servera (ne lokalnu 192.168.x.x)
- Ako server nema javnu IP, treba port forwarding na routeru

**Kako da saznaš javnu IP adresu servera:**
```bash
# Na serveru, pokreni:
curl ifconfig.me
# ili
curl ipinfo.io/ip
```

**Ako server nema javnu IP (lokalna mreža):**
- Treba port forwarding na routeru firme
- Javna IP routera → Port 80 → Server lokalna IP:80

### 2. Port Forwarding (ako je server iza routera)

Ako je server u lokalnoj mreži, treba:
- Port forwarding na routeru: `80 → server-ip:80`
- Port forwarding: `443 → server-ip:443` (za HTTPS)

### 3. Firewall na Serveru

```bash
# Otvori portove
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp  # Opciono, ako treba direktan pristup
```

---

## 🚀 Postavljanje na Lokalni Server

### Korak 1: Kopiraj Projekat na Server

```bash
# Na tvom računaru
scp -r carbon-mongoDB-project user@server-ip:/opt/
# ili
rsync -avz carbon-mongoDB-project/ user@server-ip:/opt/carbon-mongoDB-project/
```

### Korak 2: Na Serveru - Instaliraj Docker

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# Dodaj korisnika u docker grupu
sudo usermod -aG docker $USER
```

### Korak 3: Konfiguriši .env Fajl

```bash
cd /opt/carbon-mongoDB-project
nano .env
```

Proveri da su sve varijable postavljene:
```env
MONGO_URL=mongodb+srv://devlukarakic:LukaATLAS00@cluster0.fu4cybs.mongodb.net/registracije?retryWrites=true&w=majority&appName=Cluster0
RESEND_API_KEY=re_hpCKYaLU_AFJvveHpTu3VSAGETXcf2rUV
EMAIL_FROM=onboarding@resend.dev  # Za testiranje
# EMAIL_FROM=servis@smarttehnologysolution.co.rs  # Za produkciju (nakon verifikacije)
```

### Korak 4: Build Frontend

```bash
# U frontend projektu (na tvom računaru)
npm run build

# Kopiraj build na server
scp -r dist/* user@server-ip:/opt/carbon-mongoDB-project/frontend-build/
```

### Korak 5: Pokreni Docker

```bash
cd /opt/carbon-mongoDB-project
docker-compose up -d

# Proveri status
docker-compose ps
docker-compose logs -f
```

---

## 🔒 HTTPS/SSL (Preporučeno za Produkciju)

### Opcija 1: Let's Encrypt (Besplatno)

```bash
# Instaliraj Certbot
sudo apt install certbot python3-certbot-nginx

# Generiši SSL sertifikat
sudo certbot --nginx -d carbon.co.rs -d www.carbon.co.rs

# Automatski renewal
sudo certbot renew --dry-run
```

### Opcija 2: Ažuriraj Nginx za HTTPS

Dodaj u `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name carbon.co.rs www.carbon.co.rs;

    ssl_certificate /etc/letsencrypt/live/carbon.co.rs/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/carbon.co.rs/privkey.pem;

    # ... ostatak konfiguracije
}

# Redirect HTTP na HTTPS
server {
    listen 80;
    server_name carbon.co.rs www.carbon.co.rs;
    return 301 https://$server_name$request_uri;
}
```

---

## 🌍 Kako Funkcioniše sa Javnim Domenom

```
Korisnik → carbon.co.rs (DNS → IP servera)
                ↓
         Nginx (Port 80/443)
                ↓
         ├── / → Frontend (React)
         └── /api → Backend (Node.js :5000)
                ↓
         MongoDB Atlas (Cloud)
```

### Tok Zahteva:

1. **Korisnik otvara:** `https://carbon.co.rs`
2. **DNS razrešava:** `carbon.co.rs` → IP adresa servera
3. **Nginx prima zahtev:** Port 80/443
4. **Frontend:** Servira React aplikaciju
5. **API zahtev:** `https://carbon.co.rs/api/garancije`
6. **Nginx proxy:** Rutira na `backend:5000`
7. **Backend:** Obrađuje zahtev i vraća odgovor

---

## ✅ Provera da li Radi

### 1. Lokalno na serveru:
```bash
curl http://localhost/
curl http://localhost/api/garancije
```

### 2. Sa javnog domena:
```bash
curl https://carbon.co.rs/
curl https://carbon.co.rs/api/garancije
```

### 3. Iz browsera:
- Otvori: `https://carbon.co.rs`
- Proveri da frontend radi
- Testiraj registraciju garancije

---

## 🔧 Troubleshooting

### Problem: DNS ne razrešava
```bash
# Proveri DNS
nslookup carbon.co.rs
dig carbon.co.rs

# Proveri da li DNS pokazuje na pravi IP
```

### Problem: Port 80 je zauzet
```bash
# Proveri koji proces koristi port 80
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Ako je Apache ili drugi web server, zaustavi ga ili promeni port
```

### Problem: Firewall blokira
```bash
# Proveri firewall
sudo ufw status
sudo iptables -L

# Otvori portove
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Problem: Backend ne radi
```bash
# Proveri logove
docker-compose logs backend

# Proveri da li je MongoDB dostupan
docker-compose exec backend node -e "require('mongoose').connect(process.env.MONGO_URL).then(() => console.log('OK')).catch(e => console.error(e))"
```

---

## 📊 Monitoring

### Proveri Status:
```bash
# Docker kontejneri
docker-compose ps

# Logovi
docker-compose logs -f

# Resource usage
docker stats

# Health check
curl http://localhost/health
curl http://localhost/api/garancije
```

---

## 🔄 Update Procesa

Kada treba da ažuriraš kod:

```bash
# 1. Pull novi kod
git pull

# 2. Rebuild frontend (ako je promenjen)
npm run build
cp -r dist/* frontend-build/

# 3. Rebuild Docker image
docker-compose up -d --build

# 4. Proveri da li radi
curl http://localhost/api/garancije
```

---

## 🎯 Finalna Konfiguracija

### Nginx.conf (za produkciju sa HTTPS):
```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name carbon.co.rs www.carbon.co.rs;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name carbon.co.rs www.carbon.co.rs;

    ssl_certificate /etc/letsencrypt/live/carbon.co.rs/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/carbon.co.rs/privkey.pem;

    # ... ostatak konfiguracije
}
```

### Docker Compose (dodaj SSL volume):
```yaml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    - ./frontend-build:/usr/share/nginx/html:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro  # SSL sertifikati
```

---

## ✅ Checklist Pre Deploy-a

- [ ] DNS A zapis pokazuje na IP servera
- [ ] Port forwarding konfigurisan (ako je potrebno)
- [ ] Firewall otvoren (80, 443)
- [ ] Docker instaliran na serveru
- [ ] .env fajl konfigurisan
- [ ] Frontend build-ovan i kopiran
- [ ] SSL sertifikat instaliran (za HTTPS)
- [ ] Testirao lokalno na serveru
- [ ] Testirao sa javnog domena

---

## 📞 Support

Za dodatne informacije, pogledaj:
- `BACKEND_SPECIFICATION.md` - API dokumentacija
- `DOCKER_README.md` - Docker uputstva
- `PRODUCTION_CHECKLIST.md` - Production checklist

