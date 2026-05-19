const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let profiles = [];

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'banking-profile-api' });
});

app.post('/profiles', (req, res) => {
  const profile = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...req.body,
  };

  profiles.push(profile);
  res.json(profile);
});

app.get('/profiles', (req, res) => {
  res.json(profiles);
});

app.get('/profiles/:id/json', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.id);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json(profile);
});

app.get('/profiles/:id/csv', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.id);

  if (!profile) {
    return res.status(404).send('Profile not found');
  }

  const csv = Object.entries(profile)
    .map(([key, value]) => `${key},${JSON.stringify(value)}`)
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

app.get('/profiles/:id/txt', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.id);

  if (!profile) {
    return res.status(404).send('Profile not found');
  }

  const txt = Object.entries(profile)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`)
    .join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.send(txt);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
