const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Kreiranje Resend instance
const resend = new Resend(process.env.RESEND_API_KEY);

// Funkcija za učitavanje SVG loga i konvertovanje u data URI
function getLogoDataUri() {
  try {
    const logoPath = path.join(__dirname, '..', 'Carbon_logo_bold_1.svg');
    if (fs.existsSync(logoPath)) {
      const svgContent = fs.readFileSync(logoPath, 'utf8');
      // Ukloni XML deklaraciju i komentare za bolju kompatibilnost
      const cleanSvg = svgContent
        .replace(/<\?xml[^>]*\?>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim();
      // URL encode SVG za bolju kompatibilnost sa email klijentima
      const encodedSvg = encodeURIComponent(cleanSvg);
      return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
    }
  } catch (error) {
    console.error('Greška pri učitavanju loga:', error);
  }
  // Fallback - vraća prazan string ako logo ne postoji
  return '';
}

// Funkcija za slanje emaila
async function sendEmail(options) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY nije podešena u environment varijablama');
    }

    const emailData = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev', // Mora biti verified domain ili onboarding@resend.dev za testiranje
      to: Array.isArray(options.to) ? options.to : [options.to], // Resend prima array
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    };

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('❌ Resend API greška:', error);
      throw error;
    }

    console.log('✅ Email uspešno poslat:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Greška pri slanju emaila:', error);
    throw error;
  }
}

// Funkcija za izračunavanje datuma isteka garancije na osnovu kategorije proizvoda
function calculateWarrantyExpiryDate(purchaseDate, productCategory) {
  const date = new Date(purchaseDate);
  
  // Definišemo trajanje garancije u godinama za svaku kategoriju
  const warrantyYears = {
    'televizori-webos': 5,
    'televizori-android': 3,
    'bela-tehnika': 6,
    'lepota-nega': 2,
    'mali-aparati': 2
  };
  
  // Uzmi broj godina za kategoriju, ili default 2 godine ako kategorija nije pronađena
  const years = warrantyYears[productCategory] || 2;
  
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

// Funkcija za slanje emaila sa potvrdom garancije
async function sendGarancijaConfirmation(garancijaData) {
  // Izračunaj datum isteka garancije na osnovu kategorije proizvoda
  const warrantyExpiryDate = calculateWarrantyExpiryDate(
    garancijaData.purchaseDate, 
    garancijaData.productCategory
  );
  
  // Učitaj Carbon logo kao data URI
  const logoDataUri = getLogoDataUri();
  
  const htmlContent = `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARBON - Potvrda Registracije</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 50px 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">CARBON</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; color: #cbd5e0; font-weight: 300;">Vaš dom naša tehnika</p>
                        </td>
                    </tr>
                    
                    <!-- Success Badge -->
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background-color: #ffffff;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-block; text-align: center; line-height: 80px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
                                <span style="color: white; font-size: 40px; font-weight: bold;">✓</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 30px 40px; background-color: #ffffff;">
                            
                            <!-- Title -->
                            <h1 style="color: #1a202c; font-size: 32px; font-weight: 700; margin: 0 0 15px 0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                Registracija Uspešna!
                            </h1>
                            
                            <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0; text-align: center; font-weight: 400;">
                                Vaš CARBON uređaj je uspešno registrovan. Ovim ste obezbedili potpunu garanciju, tehničku podršku i prednost da prvi saznate o inovacijama.
                            </p>
                            
                            <!-- Details Cards -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <!-- Card 1 -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #667eea;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 0;">
                                                    <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Kategorija Proizvoda</p>
                                                    <p style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 700;">${garancijaData.productCategory || 'N/A'}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Card 2 -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #667eea;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 0;">
                                                    <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Model Uređaja</p>
                                                    <p style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 700;">${garancijaData.model || 'N/A'}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Card 3 -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #667eea;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 0;">
                                                    <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Serijski Broj</p>
                                                    <p style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace;">${garancijaData.serialNumber || 'N/A'}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Card 4 -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #10b981;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 0;">
                                                    <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Datum Kupovine</p>
                                                    <p style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 700;">${garancijaData.purchaseDate || 'N/A'}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Card 5 - Warranty -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #10b981;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 0;">
                                                    <p style="margin: 0 0 8px 0; color: #047857; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Garancija Važi Do</p>
                                                    <p style="margin: 0; color: #065f46; font-size: 20px; font-weight: 700;">${warrantyExpiryDate}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Thank You Message -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0 20px;">
                                <tr>
                                    <td style="text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
                                        <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px; font-weight: 700;">Hvala na Poverenju!</p>
                                        <p style="margin: 0; color: #e2e8f0; font-size: 16px; font-weight: 400;">Carbon Tim</p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 40px 30px; color: #ffffff;">
                            <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center;">Kontakt</h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 8px 0;">
                                        <a href="mailto:servis@smarttehnologysolutions.co.rs" style="color: #cbd5e0; text-decoration: none; font-size: 15px; font-weight: 500;">📧 servis@smarttehnologysolutions.co.rs</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center; padding: 8px 0;">
                                        <a href="tel:+381116351220" style="color: #cbd5e0; text-decoration: none; font-size: 15px; font-weight: 500;">📞 +381 11 635 12 20</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center; padding: 8px 0;">
                                        <a href="tel:+381116351212" style="color: #cbd5e0; text-decoration: none; font-size: 15px; font-weight: 500;">📞 +381 11 635 12 12</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center; padding: 15px 0 8px;">
                                        <a href="https://www.smarttehnologysolution.rs/" target="_blank" style="color: #90cdf4; text-decoration: none; font-size: 15px; font-weight: 600;">🌐 www.smarttehnologysolution.rs</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center; padding: 8px 0;">
                                        <a href="https://www.carbon.co.rs/" target="_blank" style="color: #90cdf4; text-decoration: none; font-size: 15px; font-weight: 600;">🌐 www.carbon.co.rs</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; text-align: center; color: #718096; font-size: 12px; font-weight: 400;">
                                Ova poruka je automatski generisana. Molimo ne odgovarajte na ovaj email.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const textContent = `
CARBON - Potvrda Registracije Garancije

Poštovani/a ${garancijaData.firstName} ${garancijaData.lastName},

Registracija vašeg CARBON uređaja je uspešno potvrđena!

Detalji registracije:
- Kategorija proizvoda: ${garancijaData.productCategory || 'N/A'}
- Model uređaja: ${garancijaData.model || 'N/A'}
- Serijski broj: ${garancijaData.serialNumber || 'N/A'}
- Datum kupovine: ${garancijaData.purchaseDate || 'N/A'}
- Garancija važi do: ${warrantyExpiryDate}

Ovim ste obezbedili potpunu garanciju, tehničku podršku i prednost da prvi saznate o inovacijama koje stižu iz Carbon linije.

Hvala na poverenju!
Carbon tim

Kontakt:
- Email: servis@smarttehnologysolutions.co.rs
- Telefon: +381 11 635 12 20 / +381 11 635 12 12
- Web: www.smarttehnologysolution.rs / www.carbon.co.rs
  `;

  return await sendEmail({
    to: garancijaData.email,
    subject: 'CARBON - Potvrda Registracije Garancije',
    text: textContent,
    html: htmlContent
  });
}

module.exports = {
  sendEmail,
  sendGarancijaConfirmation
};

