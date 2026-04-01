const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'backend/data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const seedSales = () => {
    const sales = [];
    const types = ['Petrol', 'Diesel', 'CNG'];
    const now = new Date();
    
    // Seed last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        types.forEach(type => {
            const price = type === 'Petrol' ? 106.1 : type === 'Diesel' ? 92.27 : 76.59;
            const volume = Math.floor(Math.random() * 500) + 100;
            const revenue = volume * price;
            
            sales.push({
                _id: `seed-sale-${Date.now()}-${Math.random()}`,
                date: date.toISOString(),
                pumpId: `Pump-${Math.floor(Math.random()*3)+1}`,
                fuelType: type,
                openingStock: 1000,
                closingStock: 1000 - volume,
                salesLitres: volume,
                pricePerLitre: price,
                totalRevenue: parseFloat(revenue.toFixed(2)),
                recordedBy: { _id: 'admin-fallback', name: 'Main Admin' }
            });
        });
    }
    
    fs.writeFileSync(path.join(DATA_DIR, 'sales.json'), JSON.stringify(sales, null, 2));
    console.log('Seeded sales analysis data.');
};

const seedPrices = () => {
    const prices = [
        { _id: `seed-price-${Date.now()}-1`, fuelType: 'Petrol', pricePerLitre: 106.50, date: new Date() },
        { _id: `seed-price-${Date.now()}-2`, fuelType: 'Diesel', pricePerLitre: 92.45, date: new Date() },
        { _id: `seed-price-${Date.now()}-3`, fuelType: 'CNG', pricePerLitre: 76.80, date: new Date() }
    ];
    fs.writeFileSync(path.join(DATA_DIR, 'prices.json'), JSON.stringify(prices, null, 2));
    console.log('Seeded fuel prices data.');
};

seedSales();
seedPrices();
