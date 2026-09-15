const express = require('express');
const listingsSeed = require('../data/listings.json');
const offersSeed = require('../data/offers.json');
const validateGameAttempt = require('../game/validator');
const { publicStages } = require('../game/stages');

const router = express.Router();
const listings = listingsSeed.map((listing) => ({ ...listing }));
const offers = offersSeed.map((offer) => ({ ...offer }));
const listingFields = ['title', 'sport', 'category', 'brand', 'condition', 'price', 'seller', 'status', 'createdAt'];
const offerFields = ['listingId', 'buyer', 'amount', 'status', 'createdAt'];
const conditions = ['new', 'like-new', 'good', 'fair'];
const listingStatuses = ['available', 'reserved', 'sold'];
const offerStatuses = ['pending', 'accepted', 'rejected'];

function error(res, status, message) {
  return res.status(status).json({ error: message });
}

function numericId(value) {
  return /^\d+$/.test(value) ? Number(value) : null;
}

function validateListing(body, requireAll) {
  const missing = listingFields.filter((field) => requireAll && (body[field] === undefined || body[field] === null));
  if (missing.length > 0) return `Missing required fields: ${missing.join(', ')}.`;
  if (body.condition !== undefined && !conditions.includes(body.condition)) return 'Invalid listing condition.';
  if (body.status !== undefined && !listingStatuses.includes(body.status)) return 'Invalid listing status.';
  if (body.price !== undefined && (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0)) return 'Price must be a non-negative number.';
  return null;
}

function validateOffer(body, requireAll) {
  const missing = offerFields.filter((field) => requireAll && (body[field] === undefined || body[field] === null));
  if (missing.length > 0) return `Missing required fields: ${missing.join(', ')}.`;
  if (body.amount !== undefined && (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0)) return 'Amount must be a non-negative number.';
  if (body.listingId !== undefined && (!Number.isInteger(body.listingId) || body.listingId < 1)) return 'listingId must be a positive integer.';
  if (body.status !== undefined && !offerStatuses.includes(body.status)) return 'Invalid offer status.';
  return null;
}

function nextId(items) {
  return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
}

function validateFilterQueries(req, res, next) {
  for (const [name, label] of [['maxPrice', 'maxPrice'], ['minAmount', 'minAmount']]) {
    if (req.query[name] === undefined) continue;
    if (typeof req.query[name] !== 'string' || !/^\d+(\.\d+)?$/.test(req.query[name])) {
      return error(res, 400, `${label} must be a non-negative number.`);
    }
  }
  return next();
}

function applyListingFilters(items, query) {
  let result = items.filter((listing) => (!query.sport || listing.sport === query.sport)
    && (!query.condition || listing.condition === query.condition)
    && (!query.status || listing.status === query.status)
    && (!query.maxPrice || (Number.isFinite(Number(query.maxPrice)) && listing.price <= Number(query.maxPrice))));
  if (query.sort === 'price-asc') result = result.sort((a, b) => a.price - b.price);
  if (query.sort === 'price-desc') result = result.sort((a, b) => b.price - a.price);
  if (query.sort === 'newest') result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return result;
}

function applyOfferFilters(items, query) {
  let result = items.filter((offer) => (!query.status || offer.status === query.status)
    && (!query.minAmount || (Number.isFinite(Number(query.minAmount)) && offer.amount >= Number(query.minAmount))));
  if (query.sort === 'amount-asc') result = result.sort((a, b) => a.amount - b.amount);
  if (query.sort === 'amount-desc') result = result.sort((a, b) => b.amount - a.amount);
  if (query.sort === 'newest') result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return result;
}

router.get('/game/stages', (req, res) => res.json({ stages: publicStages }));
router.use(validateGameAttempt);
router.use(validateFilterQueries);

router.get('/listings', (req, res) => res.json(applyListingFilters([...listings], req.query)));
router.get('/listings/:id/offers', (req, res) => {
  const listingId = numericId(req.params.id);
  if (listingId === null || !listings.some((listing) => listing.id === listingId)) return error(res, 404, 'Listing not found.');
  return res.json(applyOfferFilters(offers.filter((offer) => offer.listingId === listingId), req.query));
});
router.post('/listings/:id/offers', (req, res) => {
  const listingId = numericId(req.params.id);
  if (listingId === null || !listings.some((listing) => listing.id === listingId)) return error(res, 404, 'Listing not found.');
  const body = { ...req.body, listingId };
  const validationError = validateOffer(body, true);
  if (validationError) return error(res, 400, validationError);
  const offer = { id: nextId(offers), ...body };
  offers.push(offer);
  return res.status(201).json(offer);
});
router.get('/listings/:id', (req, res) => {
  const listing = listings.find((item) => item.id === numericId(req.params.id));
  return listing ? res.json(listing) : error(res, 404, 'Listing not found.');
});
router.post('/listings', (req, res) => {
  const validationError = validateListing(req.body, true);
  if (validationError) return error(res, 400, validationError);
  const listing = { id: nextId(listings), ...req.body };
  listings.push(listing);
  return res.status(201).json(listing);
});
router.patch('/listings/:id', (req, res) => {
  const listing = listings.find((item) => item.id === numericId(req.params.id));
  if (!listing) return error(res, 404, 'Listing not found.');
  if (Object.keys(req.body).some((field) => !listingFields.includes(field))) return error(res, 400, 'Unknown listing field.');
  const validationError = validateListing(req.body, false);
  if (validationError) return error(res, 400, validationError);
  Object.assign(listing, req.body);
  return res.json(listing);
});
router.put('/listings/:id', (req, res) => {
  const index = listings.findIndex((item) => item.id === numericId(req.params.id));
  if (index < 0) return error(res, 404, 'Listing not found.');
  const validationError = validateListing(req.body, true);
  if (validationError) return error(res, 400, validationError);
  listings[index] = { id: listings[index].id, ...req.body };
  return res.json(listings[index]);
});
router.delete('/listings/:id', (req, res) => {
  const index = listings.findIndex((item) => item.id === numericId(req.params.id));
  if (index < 0) return error(res, 404, 'Listing not found.');
  listings.splice(index, 1);
  return res.status(204).send();
});

router.get('/offers', (req, res) => res.json(applyOfferFilters([...offers], req.query)));
router.get('/offers/:id', (req, res) => {
  const offer = offers.find((item) => item.id === numericId(req.params.id));
  return offer ? res.json(offer) : error(res, 404, 'Offer not found.');
});
router.post('/offers', (req, res) => {
  const validationError = validateOffer(req.body, true);
  if (validationError) return error(res, 400, validationError);
  if (!listings.some((listing) => listing.id === req.body.listingId)) return error(res, 404, 'Listing not found.');
  const offer = { id: nextId(offers), ...req.body };
  offers.push(offer);
  return res.status(201).json(offer);
});
router.patch('/offers/:id', (req, res) => {
  const offer = offers.find((item) => item.id === numericId(req.params.id));
  if (!offer) return error(res, 404, 'Offer not found.');
  if (Object.keys(req.body).some((field) => !offerFields.includes(field))) return error(res, 400, 'Unknown offer field.');
  const validationError = validateOffer(req.body, false);
  if (validationError) return error(res, 400, validationError);
  if (req.body.listingId !== undefined && !listings.some((listing) => listing.id === req.body.listingId)) return error(res, 404, 'Listing not found.');
  Object.assign(offer, req.body);
  return res.json(offer);
});
router.put('/offers/:id', (req, res) => {
  const index = offers.findIndex((item) => item.id === numericId(req.params.id));
  if (index < 0) return error(res, 404, 'Offer not found.');
  const validationError = validateOffer(req.body, true);
  if (validationError) return error(res, 400, validationError);
  if (!listings.some((listing) => listing.id === req.body.listingId)) return error(res, 404, 'Listing not found.');
  offers[index] = { id: offers[index].id, ...req.body };
  return res.json(offers[index]);
});
router.delete('/offers/:id', (req, res) => {
  const index = offers.findIndex((item) => item.id === numericId(req.params.id));
  if (index < 0) return error(res, 404, 'Offer not found.');
  offers.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
