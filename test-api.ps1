$body = @{
    firstName = 'Marko'
    lastName = 'Petrovic'
    email = 'carbon.garancije@gmail.com'
    phone = '061234567'
    address = 'Bulevar Kralja Aleksandra 1'
    city = 'Beograd'
    productCategory = 'televizori-webos'
    model = 'CarbonWebOSTV43FHDSW'
    serialNumber = 'TEST123456'
    purchaseDate = '2024-01-15'
    retailer = 'Tehnomanija'
    invoiceNumber = 'INV-2024-001'
    invoiceFile = 'https://test.com/invoice.jpg'
} | ConvertTo-Json

Write-Host "Testiranje API endpointa..."
Write-Host "Email adresa: carbon.garancije@gmail.com"
Write-Host "Kategorija: televizori-webos (5 godina garancije)"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/garancije' -Method Post -Body $body -ContentType 'application/json'
    Write-Host "Uspešno! Garancija ID: $($response.garancijaId)" -ForegroundColor Green
    Write-Host "Email bi trebalo da je poslat na: carbon.garancije@gmail.com" -ForegroundColor Cyan
} catch {
    Write-Host "Greska: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Detalji: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
