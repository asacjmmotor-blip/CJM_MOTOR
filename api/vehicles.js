const searchHandler = require('./_handlers/vehicles/search');
const detailHandler = require('./_handlers/vehicles/detail');
const listHandler = require('./_handlers/vehicles/index');

module.exports = async (req, res) => {
  const url = (req.url || '').toLowerCase();

  if (url.includes('search')) return searchHandler(req, res);
  if (url.includes('detail')) return detailHandler(req, res);

  return listHandler(req, res);
};
