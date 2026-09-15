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
    schemas: {
      listings: {
        id: 'number',
        title: 'string',
        sport: 'string',
        category: 'string',
        brand: 'string',
        condition: ['new', 'like-new', 'good', 'fair'],
        price: 'number',
        seller: 'string',
        status: ['available', 'reserved', 'sold'],
        createdAt: 'ISO date string'
      },
      offers: {
        id: 'number',
        listingId: 'number',
        buyer: 'string',
        amount: 'number',
        status: ['pending', 'accepted', 'rejected'],
        createdAt: 'ISO date string'
      }
    }
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