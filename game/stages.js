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
    scenario: 'A buyer wants to inspect listing #1, the Spalding TF-1000 indoor basketball, before making an offer.',
    hint: 'Request one listing using its numeric id.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/1'
  },
  {
    id: 3,
    title: 'Find affordable nearly unused basketball equipment',
    scenario: 'Find basketball listings in like-new condition that cost no more than 400, and show the least expensive matching item first.',
    hint: 'Combine the sport and condition requirements with a maximum price and ascending price order.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings',
    expectedQuery: { sport: 'basketball', condition: 'like-new', maxPrice: '400', sort: 'price-asc' }
  },
  {
    id: 4,
    title: 'Create a new listing',
    scenario: 'Add this second-hand equipment listing: a Mikasa V200W volleyball in the fitness sport and ball category, brand Mikasa, in good condition, priced at 140. The seller is Stage Player, the listing is available, and its creation time is 2026-09-10T10:00:00.000Z.',
    hint: 'Send every listing value as a complete resource.',
    expectedMethod: 'POST',
    expectedPath: '/api/listings',
    expectedBody: { title: 'Mikasa V200W volleyball', sport: 'fitness', category: 'ball', brand: 'Mikasa', condition: 'good', price: 140, seller: 'Stage Player', status: 'available', createdAt: '2026-09-10T10:00:00.000Z' }
  },
  {
    id: 5,
    title: 'Change only the price of a listing',
    scenario: 'Lower the price of listing #1 to 75 while leaving every other listing detail unchanged.',
    hint: 'Use the partial-update HTTP concept and send only the changed price.',
    expectedMethod: 'PATCH',
    expectedPath: '/api/listings/1',
    expectedBody: { price: 75 }
  },
  {
    id: 6,
    title: 'Fully replace a listing',
    scenario: 'Replace listing #11 with a Nike Revolution training cones set for fitness and training, brand Nike, in good condition, priced at 65. The seller is Gal Mor, its status is sold, and its creation time is 2026-08-06T15:15:00.000Z.',
    hint: 'Use the full-replacement HTTP concept and provide every listing value.',
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
    scenario: 'Confirm that requesting listing #9999, which does not exist, produces a genuine not-found response.',
    hint: 'Use the numeric identifier given in the scenario.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/9999'
  },
  {
    id: 9,
    title: 'Get all offers belonging to one listing',
    scenario: 'Review every offer made on listing #1, the Spalding TF-1000 indoor basketball.',
    hint: 'Use the nested offers collection.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/1/offers'
  },
  {
    id: 10,
    title: 'Create an offer for a listing',
    scenario: 'Make an offer on listing #1 from buyer Stage Player for 80. The offer should be pending and have the creation time 2026-09-10T11:00:00.000Z.',
    hint: 'The listing identifier is part of the target resource; include all four offer values.',
    expectedMethod: 'POST',
    expectedPath: '/api/listings/1/offers',
    expectedBody: { buyer: 'Stage Player', amount: 80, status: 'pending', createdAt: '2026-09-10T11:00:00.000Z' }
  },
  {
    id: 11,
    title: 'Accept an existing offer',
    scenario: 'Accept offer #1, which belongs to listing #1, by changing its status to accepted while leaving the other offer details unchanged.',
    hint: 'Use the partial-update HTTP concept and change only the status.',
    expectedMethod: 'PATCH',
    expectedPath: '/api/offers/1',
    expectedBody: { status: 'accepted' }
  },
  {
    id: 12,
    title: 'Find high-value pending offers for one listing',
    scenario: 'For listing #5, find only offers whose status is pending and whose amount is at least 290, then show the largest amount first.',
    hint: 'Filter the listing offers by status and minimum amount, then order the results from highest amount to lowest.',
    expectedMethod: 'GET',
    expectedPath: '/api/listings/5/offers',
    expectedQuery: { status: 'pending', minAmount: '290', sort: 'amount-desc' }
  }
];

const publicStages = stages.map(({ id, title, scenario, hint }) => ({ id, title, scenario, hint }));

module.exports = { stages, publicStages };