const path = require('path');
const express = require('express');
const apiRouter = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/schemas', (req, res) => {
  res.render('schemas', {
    resources: [
      {
        name: 'Listings',
        fields: [
          { name: 'id', type: 'number', data: '1', description: 'Unique numeric listing identifier.' },
          { name: 'title', type: 'string', data: 'Spalding TF-1000 indoor basketball', description: 'Name of the sports equipment.' },
          { name: 'sport', type: 'string', data: 'basketball', description: 'Sport associated with the equipment.' },
          { name: 'category', type: 'string', data: 'ball', description: 'Equipment category.' },
          { name: 'brand', type: 'string', data: 'Spalding', description: 'Equipment brand.' },
          { name: 'condition', type: 'string', data: 'like-new', description: 'Item condition: new, like-new, good, or fair.' },
          { name: 'price', type: 'number', data: '85', description: 'Asking price in marketplace currency.' },
          { name: 'seller', type: 'string', data: 'Noam Levi', description: 'Seller display name.' },
          { name: 'status', type: 'string', data: 'available', description: 'Listing status: available, reserved, or sold.' },
          { name: 'createdAt', type: 'string', data: '2026-08-29T09:15:00.000Z', description: 'Creation timestamp in ISO date format.' }
        ]
      },
      {
        name: 'Offers',
        fields: [
          { name: 'id', type: 'number', data: '1', description: 'Unique numeric offer identifier.' },
          { name: 'listingId', type: 'number', data: '1', description: 'References the id of the listing receiving this offer.' },
          { name: 'buyer', type: 'string', data: 'Yael Shahar', description: 'Buyer display name.' },
          { name: 'amount', type: 'number', data: '70', description: 'Offer amount in marketplace currency.' },
          { name: 'status', type: 'string', data: 'pending', description: 'Offer status: pending, accepted, or rejected.' },
          { name: 'createdAt', type: 'string', data: '2026-09-01T10:00:00.000Z', description: 'Creation timestamp in ISO date format.' }
        ]
      }
    ]
  });
});

app.use('/api', apiRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && err.status === 400 && err.body) {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`RePlay server listening on port ${port}`);
  });
}

module.exports = app;