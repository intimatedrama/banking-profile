import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  employment: '',
  income: '',
  housing_status: '',
  notes: '',
};

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadProfiles = async () => {
    try {
      const res = await fetch('/profiles');
      if (!res.ok) throw new Error('Failed to load profiles');
      setProfiles(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const saveProfile = async () => {
    if (!form.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to save profile');
      }
      setForm(EMPTY_FORM);
      await loadProfiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (id) => {
    try {
      const res = await fetch(`/profiles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete profile');
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'Arial', maxWidth: 700, margin: '0 auto' }}>
      <h1>Application Profile Builder</h1>

      {error && (
        <div style={errorStyle}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 600 }}>
        <input name="full_name" placeholder="Full Name *" value={form.full_name} onChange={handleChange} style={inputStyle} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={inputStyle} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={inputStyle} />
        <input name="employment" placeholder="Employment" value={form.employment} onChange={handleChange} style={inputStyle} />
        <input name="income" placeholder="Annual Income" value={form.income} onChange={handleChange} style={inputStyle} />
        <input name="housing_status" placeholder="Housing Status" value={form.housing_status} onChange={handleChange} style={inputStyle} />
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: 80, resize: 'vertical' }}
        />
        <button onClick={saveProfile} disabled={loading} style={btnStyle}>
          {loading ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      <h2 style={{ marginTop: 40 }}>Saved Profiles</h2>

      {profiles.length === 0 && <p style={{ color: '#888' }}>No profiles saved yet.</p>}

      {profiles.map(profile => (
        <div key={profile.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>{profile.full_name}</h3>
              {profile.email && <p style={metaStyle}>{profile.email}</p>}
              {profile.phone && <p style={metaStyle}>{profile.phone}</p>}
              {profile.employment && <p style={metaStyle}>{profile.employment}</p>}
              {profile.income && <p style={metaStyle}>Income: {profile.income}</p>}
              {profile.housing_status && <p style={metaStyle}>Housing: {profile.housing_status}</p>}
              {profile.notes && <p style={{ ...metaStyle, fontStyle: 'italic', color: '#666' }}>{profile.notes}</p>}
            </div>
            <button onClick={() => deleteProfile(profile.id)} style={deleteBtnStyle} title="Delete">&#x2715;</button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <a href={`/profiles/${profile.id}/json`} style={linkStyle}>JSON</a>
            <a href={`/profiles/${profile.id}/csv`} style={linkStyle}>CSV</a>
            <a href={`/profiles/${profile.id}/txt`} style={linkStyle}>TXT</a>
          </div>
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
};

const btnStyle = {
  padding: '10px 20px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  cursor: 'pointer',
  gridColumn: '1 / -1',
};

const deleteBtnStyle = {
  background: 'none',
  border: '1px solid #ddd',
  borderRadius: 6,
  cursor: 'pointer',
  padding: '4px 8px',
  color: '#888',
  fontSize: 16,
  flexShrink: 0,
};

const linkStyle = {
  color: '#2563eb',
  textDecoration: 'none',
  fontSize: 13,
  padding: '4px 10px',
  border: '1px solid #2563eb',
  borderRadius: 4,
};

const cardStyle = {
  border: '1px solid #ddd',
  padding: 16,
  marginTop: 12,
  borderRadius: 8,
};

const metaStyle = { margin: '2px 0', fontSize: 14, color: '#444' };

const errorStyle = {
  color: '#c00',
  background: '#fee',
  border: '1px solid #fcc',
  padding: '8px 12px',
  borderRadius: 6,
  marginBottom: 16,
};
