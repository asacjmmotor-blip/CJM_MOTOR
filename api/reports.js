const reportsHandler = require('./_handlers/reports/index');

module.exports = async (req, res) => {
  return reportsHandler(req, res);
};
