// GET /api/events  -> returns festival data (events, schedule, team, contacts)
module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json(require('../events.json'));
};
