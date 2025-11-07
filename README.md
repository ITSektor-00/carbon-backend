# Carbon MongoDB Project

Ovaj projekat predstavlja Node.js aplikaciju koja koristi MongoDB bazu podataka za upravljanje podacima vezanim za ugljenik (carbon).

## Funkcionalnosti

- REST API za upravljanje podacima
- MongoDB integracija
- Docker podrška
- Model za garancije
- Bun runtime (brži od Node.js)

## Instalacija

1. Klonirajte repozitorijum:
```bash
git clone https://github.com/LukaRakic00/carbon-mongoDB-project.git
cd carbon-mongoDB-project
```

2. Instalirajte Bun (ako nemate):
```bash
# Windows
powershell -c "irm bun.sh/install.ps1|iex"

# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

3. Instalirajte zavisnosti:
```bash
bun install
```

4. Pokrenite MongoDB (potrebno je da imate MongoDB instaliran):
```bash
# Za lokalni MongoDB
mongod

# Ili koristite Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. Pokrenite aplikaciju:
```bash
bun start
```

## Docker

Za pokretanje sa Docker-om:

```bash
# Build Docker image
docker build -t carbon-mongo-project .

# Pokreni kontejner
docker run -p 5000:5000 carbon-mongo-project
```

## API Endpoints

- `GET /` - Početna stranica
- `POST /api/garancija` - Kreiranje nove garancije
- `GET /api/garancija` - Dobijanje svih garancija
- `GET /api/garancija/:id` - Dobijanje specifične garancije

## Struktura projekta

```
carbon-mongoDB-project/
├── models/          # MongoDB modeli
├── server.js        # Glavni server fajl
├── package.json     # Zavisnosti projekta
├── bun.lock         # Bun lock fajl
├── Dockerfile       # Docker konfiguracija
├── .dockerignore    # Docker ignore fajl
└── README.md        # Dokumentacija
```

## Autor

Luka Rakic - [GitHub](https://github.com/LukaRakic00)

## Licenca

Ovaj projekat je otvorenog koda. 