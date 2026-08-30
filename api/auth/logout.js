const { sendResponse } = require('../_supabase');

module.exports = async (req, res) => {
  return sendResponse(res, 200, true, 'Logout berhasil.');
};
