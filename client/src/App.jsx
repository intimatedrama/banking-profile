import { useEffect, useState } from 'react';

export default function App() {
  const [form, setForm] = useState({
    full_name: '',
    employment: '',
    income: '',
    housing_status: '',
    notes: ''
  });

  const [profiles, setProfiles] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = async () => {
    await fetch('http://localhost:5000/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    });

    loadProfiles();
  };

  const loadProfiles = async () => {
    const res = await fetch('http://localhost:5000/profiles');
    const data = await res.json();
    setProfiles(data);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'Arial' }}>
      <h1>Application Profile Builder</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
        <input name="full_name" placeholder="Full Name" onChange={handleChange} />
        <input name="employment" placeholder="Employment" onChange={handleChange} />
        <input name="income" placeholder="Annual Income" onChange={handleChange} />
        <input name="housing_status" placeholder="Housing Status" onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" onChange={handleChange} />

        <button onClick={saveProfile}>Save Profile</button>
      </div>

      <h2 style={{ marginTop: 40 }}>Saved Profiles</h2>

      {profiles.map(profile => (
        <div
          key={profile.id}
          style={{
            border: '1px solid #ccc',
            padding: 16,
            marginTop: 12,
            borderRadius: 8
          }}
        >
          <h3>{profile.full_name}</h3>
          <p>{profile.employment}</p>
          <p>{profile.income}</p>

          <div style={{ display: 'flex', gap: 12 }}>
            <a href={`http://localhost:5000/profiles/${profile.id}/json`}>
              JSON
            </a>

            <a href={`http://localhost:5000/profiles/${profile.id}/csv`}>
              CSV
            </a>

            <a href={`http://localhost:5000/profiles/${profile.id}/txt`}>
              TXT
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
