const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, 'profile_store.json');
const TMP_FILE = path.join('/tmp', 'cjm_profile_store.json');

const defaultData = {
  id: 1,
  username: 'admin',
  name: 'Admin Bengkel',
  phone: '0812-3456-7890',
  last_login: null,
  workshop_name: 'CJM Motor',
  workshop_phone: '0812-3456-7890',
  workshop_address: 'Jl. Contoh No. 123 Jakarta',
  workshop_open_time: '08:00',
  workshop_close_time: '20:00',
  workshop_operating_days: 'Senin - Sabtu'
};

function getFormattedDateTime(dateObj = new Date()) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const dateStr = `${String(dateObj.getDate()).padStart(2, '0')} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  return dateStr;
}

let inMemoryData = null;

function loadStore() {
  if (inMemoryData) return inMemoryData;

  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf8');
      inMemoryData = JSON.parse(content);
      return inMemoryData;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(TMP_FILE)) {
      const content = fs.readFileSync(TMP_FILE, 'utf8');
      inMemoryData = JSON.parse(content);
      return inMemoryData;
    }
  } catch (e) {}

  inMemoryData = { ...defaultData, last_login: getFormattedDateTime() };
  saveStore(inMemoryData);
  return inMemoryData;
}

function saveStore(data) {
  inMemoryData = { ...data };
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryData, null, 2));
  } catch (e) {}
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(inMemoryData, null, 2));
  } catch (e) {}
}

module.exports = {
  loadStore,
  saveStore,
  getFormattedDateTime
};
