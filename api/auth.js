const loginHandler = require('./_handlers/auth/login');
const logoutHandler = require('./_handlers/auth/logout');
const membersHandler = require('./_handlers/auth/members');
const profileHandler = require('./_handlers/auth/profile');

module.exports = async (req, res) => {
  const url = (req.url || '').toLowerCase();

  if (url.includes('login')) return loginHandler(req, res);
  if (url.includes('logout')) return logoutHandler(req, res);
  if (url.includes('members')) return membersHandler(req, res);
  if (url.includes('profile')) return profileHandler(req, res);

  return res.status(404).json({ success: false, message: 'Endpoint auth tidak ditemukan.' });
};
