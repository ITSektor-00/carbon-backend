require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Garancija = require('./models/Garancija');
const { sendEmail, sendGarancijaConfirmation } = require('./services/emailService');

const app = express();

app.use(express.json());

// CORS konfiguracija
const corsOptions = {
  origin: [
    'https://www.carbon.co.rs',
    'https://carbon.co.rs',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Legacy browser support
};

app.use(cors(corsOptions));

// CORS middleware već automatski rukuje OPTIONS zahtevima, ne treba eksplicitno app.options()

// Povezivanje sa MongoDB
if (!process.env.MONGO_URL) {
  console.error('❌ MONGO_URL nije postavljen u environment varijablama!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 5000, // Timeout za povezivanje
  socketTimeoutMS: 45000, // Timeout za socket operacije
});

// Dodaj event listeners za MongoDB povezivanje
mongoose.connection.on('connected', () => {
  console.log('✅ Uspesno povezan sa MongoDB!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

console.log('SERVER STARTUJE!');

// Health check endpoint (koristi Render za proveru statusa)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Carbon Backend API',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint za Render
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// GET ruta za proveru svih garancija
app.get('/api/garancije', async (req, res) => {
  try {
    const garancije = await Garancija.find({});
    console.log(`📊 Pronađeno ${garancije.length} garancija u bazi`);
    res.json({ count: garancije.length, garancije });
  } catch (err) {
    console.error('❌ Greška pri učitavanju garancija:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST ruta sa validacijom - sada prima JSON umesto FormData
app.post('/api/garancije', async (req, res) => {
  try {
    const data = req.body;
    console.log('📝 POST /api/garancije - Primljeni podaci:', data);
    
    // Validacija: sva polja moraju biti popunjena
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city',
      'productCategory', 'model', 'serialNumber', 'purchaseDate', 'retailer', 'invoiceNumber', 'invoiceFile'
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.log(`❌ Nedostaje polje: ${field}`);
        return res.status(400).json({ error: `Polje '${field}' je obavezno!` });
      }
    }

    const garancija = new Garancija(data);
    console.log('💾 Pokušavam čuvanje garancije:', garancija);
    
    const savedGarancija = await garancija.save();
    console.log('✅ Garancija uspešno sačuvana! ID:', savedGarancija._id);
    
    // Automatski pošalji email potvrdu (opciono)
    try {
      await sendGarancijaConfirmation(data);
      console.log('📧 Email potvrda poslata korisniku');
    } catch (emailError) {
      console.error('⚠️ Greška pri slanju emaila (garancija je sačuvana):', emailError.message);
      // Ne prekidamo proces ako email ne uspe
    }
    
    res.status(201).json({ 
      message: 'Uspešno sačuvano!', 
      imageUrl: data.invoiceFile,
      garancijaId: savedGarancija._id 
    });
  } catch (err) {
    // Loguj sve moguće informacije o grešci
    console.error('FULL ERROR:', err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    // Loguj sve property-je objekta
    for (const key in err) {
      if (Object.prototype.hasOwnProperty.call(err, key)) {
        console.error(`err[${key}]:`, err[key]);
      }
    }
    // Loguj kao string
    try {
      console.error('Stringified error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    } catch (e) {
      console.error('Error stringifying:', e);
    }
    // U produkciji ne prikazujemo stack trace
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(500).json({
      error: err.message || 'Internal server error',
      ...(isProduction ? {} : { stack: err.stack })
    });
  }
});

// GET ruta za dohvat garancije po ID-u
app.get('/api/garancije/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const garancija = await Garancija.findById(id);
    
    if (!garancija) {
      return res.status(404).json({ error: 'Garancija nije pronađena!' });
    }
    
    res.json(garancija);
  } catch (err) {
    console.error('❌ Greška pri učitavanju garancije:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST ruta za slanje emaila na osnovu ID-a garancije iz baze
app.post('/api/garancije/:id/send-email', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Dohvati garanciju iz baze
    const garancija = await Garancija.findById(id);
    
    if (!garancija) {
      return res.status(404).json({ error: 'Garancija nije pronađena!' });
    }
    
    // Konvertuj Mongoose dokument u običan objekat
    const garancijaData = garancija.toObject();
    
    // Pošalji email sa podacima iz baze
    const result = await sendGarancijaConfirmation(garancijaData);
    
    res.status(200).json({ 
      success: true, 
      message: 'Email uspešno poslat!',
      messageId: result.messageId,
      garancijaId: id
    });
  } catch (err) {
    console.error('❌ Greška pri slanju emaila:', err);
    res.status(500).json({ 
      error: 'Greška pri slanju emaila', 
      details: err.message 
    });
  }
});

// POST ruta za slanje emaila
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ 
        error: 'Polja "to", "subject" i ("text" ili "html") su obavezna!' 
      });
    }

    const result = await sendEmail({ to, subject, text, html });
    res.status(200).json({ 
      success: true, 
      message: 'Email uspešno poslat!',
      messageId: result.messageId 
    });
  } catch (err) {
    console.error('❌ Greška pri slanju emaila:', err);
    res.status(500).json({ 
      error: 'Greška pri slanju emaila', 
      details: err.message 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  
  // U produkciji ne prikazujemo stack trace
  const isProduction = process.env.NODE_ENV === 'production';
  
  const errorResponse = {
    error: err.message || 'Internal server error',
    ...(isProduction ? {} : { stack: err.stack })
  };
  
  res.status(err.status || 500).json(errorResponse);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});