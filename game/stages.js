const stages = [
  {
    id: 1,
    title: 'Browse all listings',
    scenario: 'Explore the second-hand sports equipment marketplace.',
    hint: 'Request the listings collection.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings'
  },
  {
    id: 2,
    title: 'Get a specific listing by id',
    scenario: 'Open the details for the first basketball listing.',
    hint: 'Request one listing using its numeric id.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/1'
  },
  {
    id: 3,
    title: 'Find basketball listings that are like-new, max price 400, sorted price ascending',
    scenario: 'Find an affordable, nearly unused basketball item.',
    hint: 'Combine sport, condition, maxPrice, and ascending price sort.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings',
    expectedQuery: { sport: 'basketball', condition: 'like-new', maxPrice: '400', sort: 'price-asc' }
  },
  {
    id: 4,
    title: 'Create a new listing',
    scenario: 'Add a second-hand volleyball to the marketplace.',
    hint: 'Send a complete listing resource with JSON.',
    expectedMethod: 'POST',
    expectedPath: '/api/listings',
    expectedBody: { title: 'Mikasa V200W volleyball', sport: 'fitness', category: 'ball', brand: 'Mikasa', condition: 'good', price: 140, seller: 'Stage Player', status: 'available', createdAt: '2026-09-10T10:00:00.000Z' }
  },
  {
    id: 5,
    title: 'Change only the price of a listing using PATCH',
    scenario: 'Lower the price of listing 1.',
    hint: 'Use PATCH and send only the changed price.',
    expectedMethod: 'PATCH',
    expectedPath: '/api/listings/1',
    expectedBody: { price: 75 }
  },
  {
    id: 6,
    title: 'Fully replace a listing using PUT',
    scenario: 'Replace the details of listing 11 with a complete resource.',
    hint: 'PUT requires every mandatory listing field.',
    expectedMethod: 'PUT',
    expectedPath: '/api/listings/11',
    expectedBody: { title: 'Nike Revolution training cones set', sport: 'fitness', category: 'training', brand: 'Nike', condition: 'good', price: 65, seller: 'Gal Mor', status: 'sold', createdAt: '2026-08-06T15:15:00.000Z' }
  },
  {
    id: 7,
    title: 'Delete a listing',
    scenario: 'Remove listing 12 from the marketplace.',
    hint: 'Use the collection resource and the DELETE method.',
    expectedMethod: 'DELETE',
    expectedPath: '/api/listings/12'
  },
  {
    id: 8,
    title: 'Request a deliberately nonexistent listing and receive a real 404',
    scenario: 'Confirm that a missing listing produces a genuine not-found response.',
    hint: 'Request a numeric id that is not present.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/9999'
  },
  {
    id: 9,
    title: 'Get all offers belonging to one listing',
    scenario: 'Review every offer made on listing 1.',
    hint: 'Use the nested offers collection.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/1/offers'
  },
  {
    id: 10,
    title: 'Create an offer for a listing',
    scenario: 'Make an offer on listing 1.',
    hint: 'The listing id belongs in the route; send buyer, amount, status, and createdAt.',
    expectedMethod: 'POST',
    expectedPath: '/api/listings/1/offers',
    expectedBody: { buyer: 'Stage Player', amount: 80, status: 'pending', createdAt: '2026-09-10T11:00:00.000Z' }
  },
  {
    id: 11,
    title: 'Accept an existing offer using PATCH',
    scenario: 'Accept offer 1 for listing 1.',
    hint: 'Patch the offer status only.',
    expectedMethod: 'PATCH',
    expectedPath: '/api/offers/1',
    expectedBody: { status: 'accepted' }
  },
  {
    id: 12,
    title: 'Get offers for one listing filtered by pending status, minimum amount, and descending amount sort',
    scenario: 'Find high-value pending offers on listing 5.',
    hint: 'Filter the nested collection by status and minimum amount, then sort descending.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/5/offers',
    expectedQuery: { status: 'pending', minAmount: '290', sort: 'amount-desc' }
  }
];

const publicStages = stages.map(({ id, title, scenario, hint }) => ({ id, title, scenario, hint }));

module.exports = { stages, publicStages };