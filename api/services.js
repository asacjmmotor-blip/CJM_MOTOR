const createHandler = require('./_handlers/services/create');
const deleteHandler = require('./_handlers/services/delete');
const detailHandler = require('./_handlers/services/detail');
const listHandler = require('./_handlers/services/index');
const updateHandler = require('./_handlers/services/update');

module.exports = async (req, res) => {
  const url = req.url || '';
  if (url.includes('/create')) return createHandler(req, res);
  if (url.includes('/delete')) return deleteHandler(req, res);
  if (url.includes('/detail')) return detailHandler(req, res);
  if (url.includes('/update')) return updateHandler(req, res);
  return listHandler(req, res);
};
