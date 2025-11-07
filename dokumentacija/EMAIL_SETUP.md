# Email Setup - Resend

## 📧 Environment Varijable

Dodaj u `.env` fajl:

```env
# Resend API Key
RESEND_API_KEY=re_hpCKYaLU_AFJvveHpTu3VSAGETXcf2rUV

# Email From (koristi onboarding@resend.dev za testiranje)
EMAIL_FROM=onboarding@resend.dev

# Carbon Logo URL (postavi nakon upload-a na Cloudinary)
CARBON_LOGO_URL=https://res.cloudinary.com/tvoj-cloud/image/upload/v1/carbon-logo.png
```

## 🖼️ Kako da postaviš Carbon Logo

### Opcija 1: Cloudinary (Preporučeno)

1. **Upload logo na Cloudinary:**
   - Idi na [Cloudinary Dashboard](https://cloudinary.com/console)
   - Upload tvoj Carbon logo (PNG ili SVG sa transparentnom pozadinom)
   - Preporučene dimenzije: 200px širina
   - Kopiraj URL slike

2. **Dodaj URL u `.env`:**
   ```
   CARBON_LOGO_URL=https://res.cloudinary.com/tvoj-cloud/image/upload/v1/carbon-logo.png
   ```

### Opcija 2: Direktni URL

Ako već imaš logo na nekom drugom hosting servisu, samo dodaj URL u `.env`.

### Opcija 3: Base64 (za testiranje)

Za brzo testiranje, možeš koristiti Base64 encoded logo, ali to nije preporučeno za produkciju.

## 📝 Logo Specifikacije

- **Format:** PNG ili SVG (sa transparentnom pozadinom)
- **Širina:** 150-200px (optimalno)
- **Pozadina:** Transparentna
- **Lokacija u email-u:** Header sekcija, iznad "CARBON" teksta

## 🧪 Testiranje Email-a

### 1. Test ruta (POST /api/send-email)

```bash
curl -X POST http://localhost:5000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ltc.it.sektor@gmail.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

### 2. Automatski email (nakon POST /api/garancije)

Kada kreiraš novu garanciju, automatski će se poslati email sa potvrdom.

## ✅ Provera

1. Proveri da li su sve environment varijable postavljene
2. Restartuj server
3. Testiraj slanje emaila
4. Proveri inbox (i spam folder)

## 🔧 Troubleshooting

**Email se ne šalje:**
- Proveri da li je `RESEND_API_KEY` ispravna
- Proveri da li je `EMAIL_FROM` validan
- Proveri server logove za greške

**Logo se ne prikazuje:**
- Proveri da li je `CARBON_LOGO_URL` ispravan
- Proveri da li je logo javno dostupan (ne zahteva autentifikaciju)
- Proveri da li email klijent podržava eksterne slike

