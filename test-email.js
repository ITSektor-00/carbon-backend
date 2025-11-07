require('dotenv').config();
const { sendGarancijaConfirmation } = require('./services/emailService');

// Test podaci za garanciju - novi format
const testGarancijaData = {
  firstName: 'Marko',
  lastName: 'Petrović',
  email: 'carbon.garancije@gmail.com', // Resend test email
  phone: '061234567',
  address: 'Bulevar Kralja Aleksandra 1',
  city: 'Beograd',
  productCategory: 'televizori-webos', // Test sa 5 godina garancije
  model: 'CarbonWebOSTV43FHDSW',
  serialNumber: 'ABC123456',
  purchaseDate: '2024-01-15',
  retailer: 'Tehnomanija',
  invoiceNumber: 'INV-2024-001',
  invoiceFile: 'https://res.cloudinary.com/.../image/upload/...'
};

async function testEmail() {
  try {
    console.log('🧪 Testiranje slanja emaila...');
    console.log('📧 Šaljem na:', testGarancijaData.email);
    console.log('📦 Kategorija:', testGarancijaData.productCategory);
    console.log('📅 Datum kupovine:', testGarancijaData.purchaseDate);
    
    // Izračunaj očekivani datum isteka garancije
    const warrantyYears = {
      'televizori-webos': 5,
      'televizori-android': 3,
      'bela-tehnika': 6,
      'lepota-nega': 2,
      'mali-aparati': 2
    };
    const years = warrantyYears[testGarancijaData.productCategory] || 2;
    const purchaseDate = new Date(testGarancijaData.purchaseDate);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + years);
    console.log(`⏰ Očekivani datum isteka garancije: ${expiryDate.toISOString().split('T')[0]} (${years} godina)`);
    
    const result = await sendGarancijaConfirmation(testGarancijaData);
    
    console.log('\n✅ Email uspešno poslat!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\n💡 Proveri inbox (i spam folder) na:', testGarancijaData.email);
  } catch (error) {
    console.error('❌ Greška pri slanju emaila:', error.message);
    console.error('Detalji:', error);
    
    if (error.message.includes('RESEND_API_KEY')) {
      console.log('\n💡 Proveri da li je RESEND_API_KEY postavljen u .env fajlu');
    }
  }
}

testEmail();

