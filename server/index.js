const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'profiles.json');

app.use(cors());
app.use(express.json());

async function loadProfiles() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProfiles(profiles) {
  await fs.writeFile(DATA_FILE, JSON.stringify(profiles, null, 2));
}

function csvEscape(value) {
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'banking-profile-api' });
});

app.post('/profiles', async (req, res) => {
  const { full_name, employment, income, housing_status, email, phone, notes } = req.body;
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: 'full_name is required' });
  }

  const profiles = await loadProfiles();
  const profile = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    full_name: full_name.trim(),
    email: email ?? '',
    phone: phone ?? '',
    employment: employment ?? '',
    income: income ?? '',
    housing_status: housing_status ?? '',
    notes: notes ?? '',
  };

  profiles.push(profile);
  await saveProfiles(profiles);
  res.status(201).json(profile);
});

app.get('/profiles', async (req, res) => {
  const profiles = await loadProfiles();
  res.json(profiles);
});

app.get('/profiles/:id', async (req, res) => {
  const profiles = await loadProfiles();
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

app.patch('/profiles/:id', async (req, res) => {
  const profiles = await loadProfiles();
  const index = profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Profile not found' });

  profiles[index] = {
    ...profiles[index],
    ...req.body,
    id: profiles[index].id,
    createdAt: profiles[index].createdAt,
  };
  await saveProfiles(profiles);
  res.json(profiles[index]);
});

app.delete('/profiles/:id', async (req, res) => {
  const profiles = await loadProfiles();
  const index = profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Profile not found' });

  profiles.splice(index, 1);
  await saveProfiles(profiles);
  res.status(204).send();
});

app.get('/profiles/:id/json', async (req, res) => {
  const profiles = await loadProfiles();
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.setHeader('Content-Disposition', `attachment; filename="profile-${profile.id}.json"`);
  res.json(profile);
});

app.get('/profiles/:id/csv', async (req, res) => {
  const profiles = await loadProfiles();
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) return res.status(404).send('Profile not found');

  const rows = [
    Object.keys(profile).join(','),
    Object.values(profile).map(csvEscape).join(','),
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="profile-${profile.id}.csv"`);
  res.send(rows.join('\n'));
});

app.get('/profiles/:id/txt', async (req, res) => {
  const profiles = await loadProfiles();
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) return res.status(404).send('Profile not found');

  const txt = Object.entries(profile)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`)
    .join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="profile-${profile.id}.txt"`);
  res.send(txt);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
