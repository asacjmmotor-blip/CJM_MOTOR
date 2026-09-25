const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE_FILE = path.join(__dirname, 'profile_store.json');
const TMP_FILE = path.join(os.tmpdir(), 'cjm_profile_store.json');

const defaultData = {
  id: 1,
  username: 'admin',
  name: 'Admin Bengkel',
  phone: '0812-3456-7890',
  role: 'Admin Utama',
  last_login: null,
  workshop_name: 'CJM Motor',
  workshop_phone: '0812-3456-7890',
  workshop_address: 'Jl. Contoh No. 123 Jakarta',
  workshop_open_time: '08:00',
  workshop_close_time: '20:00',
  workshop_operating_days: 'Senin - Sabtu',
  members: [
    {
      id: 1,
      name: 'Admin Bengkel',
      username: 'admin',
      phone: '0812-3456-7890',
      role: 'Admin Utama',
      created_at: '2026-01-01'
    }
  ]
};

function getFormattedDateTime(dateObj = new Date()) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const dateStr = `${String(dateObj.getDate()).padStart(2, '0')} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  return dateStr;
}

let inMemoryData = null;

function loadStore() {
  if (inMemoryData) return inMemoryData;

  // 1. Try TMP_FILE first (holds latest saved updates across restarts / serverless instances)
  try {
    if (fs.existsSync(TMP_FILE)) {
      const content = fs.readFileSync(TMP_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        inMemoryData = parsed;
      }
    }
  } catch (e) {}

  // 2. Try STORE_FILE (committed default profile store file)
  if (!inMemoryData) {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const content = fs.readFileSync(STORE_FILE, 'utf8');
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          inMemoryData = parsed;
        }
      }
    } catch (e) {}
  }

  if (!inMemoryData) {
    inMemoryData = { ...defaultData, last_login: getFormattedDateTime() };
  }

  if (!inMemoryData.members || !Array.isArray(inMemoryData.members) || inMemoryData.members.length === 0) {
    inMemoryData.members = [
      {
        id: inMemoryData.id || 1,
        name: inMemoryData.name || 'Admin Bengkel',
        username: inMemoryData.username || 'admin',
        phone: inMemoryData.phone || '0812-3456-7890',
        role: inMemoryData.role || 'Admin Utama',
        created_at: '2026-01-01'
      }
    ];
  }

  saveStore(inMemoryData);
  return inMemoryData;
}

function saveStore(data) {
  inMemoryData = { ...data };

  // Save to TMP_FILE first (cross-platform os.tmpdir())
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(inMemoryData, null, 2), 'utf8');
  } catch (e) {}

  // Save to STORE_FILE (local filesystem update)
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryData, null, 2), 'utf8');
  } catch (e) {}
}

module.exports = {
  loadStore,
  saveStore,
  getFormattedDateTime
};

