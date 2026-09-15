const { stages } = require('./stages');

function valuesMatch(actual, expected) {
  if (typeof expected !== 'object' || expected === null) {
    return actual === expected;
  }

  if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) {
    return false;
  }

  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);
  return actualKeys.length === expectedKeys.length
    && expectedKeys.every((key) => Object.prototype.hasOwnProperty.call(actual, key)
      && valuesMatch(actual[key], expected[key]));
}

function validateGameAttempt(req, res, next) {
  const stageHeader = req.get('X-Stage-Id');

  if (stageHeader === undefined) {
    return next();
  }

  const stage = stages.find((item) => String(item.id) === stageHeader);
  if (!stage) {
    return res.status(422).json({ error: 'Unknown game stage.' });
  }

  if (req.method !== stage.expectedMethod) {
    return res.status(422).json({ error: 'Check the HTTP method for this action.' });
  }

  if (`${req.baseUrl}${req.path}` !== stage.expectedPath) {
    return res.status(422).json({ error: 'Review the route used for this challenge.' });
  }

  const actualQuery = req.query;
  const expectedQuery = stage.expectedQuery || {};
  if (!valuesMatch(actualQuery, expectedQuery)) {
    return res.status(422).json({ error: 'Review the query parameters required by this challenge.' });
  }

  if (stage.expectedBody !== undefined && !valuesMatch(req.body || {}, stage.expectedBody)) {
    return res.status(422).json({ error: 'Review the request body required by this challenge.' });
  }

  res.set('X-Game-Stage-Valid', 'true');
  return next();
}

module.exports = validateGameAttempt;