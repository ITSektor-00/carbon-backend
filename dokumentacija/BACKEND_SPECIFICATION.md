# CARBON Backend - Specifikacija

## 📋 Opšti Pregled

Ovaj backend se koristi za:
- **Registraciju garancija** za CARBON proizvode
- **Čuvanje podataka** u MongoDB bazu
- **Slanje email potvrda** korisnicima preko Resend servisa

---

## 🗄️ Baza Podataka

### MongoDB Atlas
- **Lokacija:** Cloud (MongoDB Atlas)
- **Connection String:** `mongodb+srv://devlukarakic:LukaATLAS00@cluster0.fu4cybs.mongodb.net/registracije?retryWrites=true&w=majority&appName=Cluster0`
- **Baza:** `registracije`
- **Kolekcija:** `garancije`

### Struktura Podataka (Garancija Model)

```javascript
{
  firstName: String,          // Ime korisnika
  lastName: String,           // Prezime korisnika
  email: String,              // Email adresa korisnika
  phone: String,              // Telefon korisnika
  address: String,            // Adresa korisnika
  city: String,               // Grad korisnika
  productCategory: String,    // Kategorija proizvoda (vidi dole)
  model: String,              // Model uređaja
  serialNumber: String,       // Serijski broj
  purchaseDate: String,       // Datum kupovine (format: YYYY-MM-DD)
  retailer: String,           // Prodavac
  invoiceNumber: String,      // Broj računa
  invoiceFile: String         // URL slike računa (Cloudinary)
}
```

### Kategorije Proizvoda (productCategory)

| Kategorija | Trajanje Garancije |
|------------|-------------------|
| `televizori-webos` | 5 godina |
| `televizori-android` | 3 godine |
| `bela-tehnika` | 6 godina |
| `lepota-nega` | 2 godine |
| `mali-aparati` | 2 godine |

**Važno:** Backend automatski izračunava datum isteka garancije na osnovu `productCategory` i `purchaseDate`.

---

## 📧 Email Servis (Resend)

### Konfiguracija
- **Servis:** Resend API
- **API Key:** `re_hpCKYaLU_AFJvveHpTu3VSAGETXcf2rUV`
- **From Email (Test):** `onboarding@resend.dev`
- **From Email (Produkcija):** `servis@smarttehnologysolution.co.rs` (zahteva verifikaciju domena)

### Šta se šalje
- **Automatski:** Email potvrda se šalje kada se kreira nova garancija
- **Ručno:** Može se poslati email za postojeću garanciju preko ID-a

### Email Sadržaj
- HTML template sa modernim dizajnom
- Podaci o garanciji (kategorija, model, serijski broj, itd.)
- **Datum isteka garancije** (automatski izračunat na osnovu kategorije)
- Kontakt informacije

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000  (lokalno)
https://your-render-url.onrender.com  (produkcija)
```

### 1. GET `/api/garancije`
**Dohvata sve garancije iz baze**

**Response:**
```json
{
  "count": 10,
  "garancije": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Marko",
      "lastName": "Petrović",
      "email": "marko@example.com",
      ...
    }
  ]
}
```

---

### 2. GET `/api/garancije/:id`
**Dohvata garanciju po ID-u**

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "Marko",
  "lastName": "Petrović",
  ...
}
```

---

### 3. POST `/api/garancije`
**Kreira novu garanciju i automatski šalje email potvrdu**

**Request Body:**
```json
{
  "firstName": "Marko",
  "lastName": "Petrović",
  "email": "marko@example.com",
  "phone": "061234567",
  "address": "Bulevar Kralja Aleksandra 1",
  "city": "Beograd",
  "productCategory": "televizori-webos",
  "model": "CarbonWebOSTV43FHDSW",
  "serialNumber": "ABC123456",
  "purchaseDate": "2024-01-15",
  "retailer": "Tehnomanija",
  "invoiceNumber": "INV-2024-001",
  "invoiceFile": "https://res.cloudinary.com/.../image/upload/..."
}
```

**Response (201 Created):**
```json
{
  "message": "Uspešno sačuvano!",
  "imageUrl": "https://res.cloudinary.com/.../image/upload/...",
  "garancijaId": "507f1f77bcf86cd799439011"
}
```

**Važno:**
- Sva polja su obavezna
- Email se automatski šalje korisniku
- Ako email ne uspe, garancija se i dalje čuva u bazi

---

### 4. POST `/api/garancije/:id/send-email`
**Dohvata garanciju iz baze po ID-u i šalje email potvrdu**

**Primer:**
```
POST /api/garancije/507f1f77bcf86cd799439011/send-email
```

**Response:**
```json
{
  "success": true,
  "message": "Email uspešno poslat!",
  "messageId": "e4bac555-13b4-4cfb-bb10-521f3aad0f09",
  "garancijaId": "507f1f77bcf86cd799439011"
}
```

**Kada koristiti:**
- Kada želiš da pošalješ email za postojeću garanciju
- Kada email automatski nije poslat prilikom kreiranja
- Za re-slanje emaila

---

### 5. POST `/api/send-email`
**Ručno slanje emaila (opciono)**

**Request Body:**
```json
{
  "to": "korisnik@example.com",
  "subject": "Naslov emaila",
  "text": "Tekstualna verzija",
  "html": "<h1>HTML verzija</h1>"
}
```

---

## 🔧 Environment Varijable (.env)

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://devlukarakic:LukaATLAS00@cluster0.fu4cybs.mongodb.net/registracije?retryWrites=true&w=majority&appName=Cluster0

# Resend Email Configuration
RESEND_API_KEY=re_hpCKYaLU_AFJvveHpTu3VSAGETXcf2rUV
EMAIL_FROM=onboarding@resend.dev  # Za testiranje
# EMAIL_FROM=servis@smarttehnologysolution.co.rs  # Za produkciju (zahteva verifikaciju domena)
```

---

## 📦 Stack

- **Runtime:** Bun (ili Node.js)
- **Framework:** Express.js
- **Database:** MongoDB (MongoDB Atlas)
- **ORM:** Mongoose
- **Email Service:** Resend API
- **CORS:** Omogućen za sve origin-e

---

## 🚀 Pokretanje

```bash
# Instalacija paketa
npm install

# Pokretanje servera
npm start
# ili
bun server.js

# Server radi na portu 5000
```

---

## 📝 Važne Napomene

1. **Automatsko slanje emaila:** Email se automatski šalje kada se kreira nova garancija
2. **Garancija se čuva čak i ako email ne uspe:** Ako Resend ne radi, garancija se i dalje čuva u bazi
3. **Datum isteka garancije:** Automatski se izračunava na osnovu `productCategory` i `purchaseDate`
4. **Frontend šalje JSON:** Frontend aplikacija šalje podatke kao JSON (ne FormData)
5. **invoiceFile je URL:** Slika računa se ne upload-uje ovde, već se šalje Cloudinary URL

---

## 🔗 Integracija sa Frontend-om

Frontend aplikacija šalje podatke na:
```
${VITE_API_URL}/api/garancije
```

**Format:** JSON
**Method:** POST
**Headers:** `Content-Type: application/json`

---

## 📞 Kontakt & Podrška

Za dodatne informacije kontaktiraj backend tim.

