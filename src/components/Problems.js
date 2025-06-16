import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

const ALL_DIFFICULTY = ['Easy', 'Medium', 'Hard'];
const PAGE_SIZE = 100;

function Problems() {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [problems, setProblems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [allTags, setAllTags] = useState([]);
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add problem modal
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState([]);
  const [newDifficulty, setNewDifficulty] = useState('Easy');
  const [newDesc, setNewDesc] = useState('');

  // Problems fetching logic
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (selectedTags.length) params.append('tags', selectedTags.join(','));
      if (difficulty) params.append('difficulty', difficulty);
      const res = await fetch(`http://localhost:5000/api/problems?${params.toString()}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Failed to fetch problems');
      else {
        setProblems(data.problems);
        setTotal(data.total);
        // dynamically set all tags
        const tags = Array.from(new Set(data.problems.flatMap(p => p.tags)));
        setAllTags(tags);
      }
    } catch (e) {
      setError('Network error');
    }
    setLoading(false);
  }, [page, search, selectedTags, difficulty]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Toggle favorite and status logic
  const toggleFavorite = async (id) => {
    const p = problems.find(p => p._id === id);
    try {
      await fetch('http://localhost:5000/api/problems/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ problemId: id, favorite: !p.favorite })
      });
      fetchProblems(); // Pull latest data
    } catch {}
  };
  const toggleStatus = async (id, status) => {
    try {
      await fetch('http://localhost:5000/api/problems/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ problemId: id, status })
      });
      fetchProblems(); // Pull latest data
    } catch {}
  };

  // Navigation and theme handling
  const handleEditor = () => history.push('/');
  const handleCodeRunner = () => history.push('/coderunner');
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    history.push('/login');
  };
  const handleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Add problem handling
  const handleAddProblem = async () => {
    if (!newTitle.trim()) return alert('Title required!');
    try {
      const res = await fetch('http://localhost:5000/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, tags: newTags, difficulty: newDifficulty, description: newDesc })
      });
      const data = await res.json();
      if (res.ok) setProblems([...problems, { ...data.problem, status: '', favorite: false }]);
    } catch {}
    setShowAdd(false);
    setNewTitle('');
    setNewTags([]);
    setNewDifficulty('Easy');
    setNewDesc('');
  };

  // Multi-select tags handling
  const handleTagSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedTags(options);
    setPage(1); // Reset to first page on filter
  };
  const handleNewTagsSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map(o => o.value);
    setNewTags(options);
  };

  // Reset to first page on search and difficulty filter
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleDifficulty = (e) => {
    setDifficulty(e.target.value);
    setPage(1);
  };

  // Pagination controls
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pageList = [];
  for (let i = 1; i <= totalPages; ++i) pageList.push(i);

  return (
    <div>
      <div className={`editor-header`}>
        <div className="user-info">Hello, {user.username || 'User'}</div>
        <div className="toolbar">
          <button onClick={handleEditor}>Editor</button>
          <button onClick={handleCodeRunner}>Code Runner</button>
          <button onClick={() => setShowAdd(true)}>Add problem</button>
          <button onClick={handleTheme}>{theme === 'light' ? 'Dark Theme' : 'Light Theme'}</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Problems</h2>
        </div>
        {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : <>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <input
            placeholder="Search by title"
            value={search}
            onChange={handleSearch}
            style={{ padding: 6, fontSize: 15 }}
          />
          <select multiple value={selectedTags} onChange={handleTagSelect} style={{ minWidth: 120 }}>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={difficulty} onChange={handleDifficulty}>
            <option value="">All Difficulty</option>
            {ALL_DIFFICULTY.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8 }}>#</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Favorite</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, idx) => (
              <tr key={p._id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                <td style={{ padding: 8, verticalAlign: 'middle', textAlign: 'center' }}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td style={{ verticalAlign: 'middle' }}>
                  <span onClick={() => history.push(`/coderunner?id=${p._id}`)} style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>{p.title}</span>
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>{p.tags.join(', ')}</td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>{p.difficulty}</td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                  <select value={p.status} onChange={e => toggleStatus(p._id, e.target.value)} style={{ minWidth: 80, textAlign: 'center' }}>
                    <option value="">None</option>
                    <option value="Solved">Solved</option>
                    <option value="Unsolved">Unsolved</option>
                    <option value="Hard">Hard</option>
                  </select>
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                  <button onClick={() => toggleFavorite(p._id)} style={{ color: p.favorite ? '#f39c12' : '#888', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', verticalAlign: 'middle' }}>
                    {p.favorite ? '★' : '☆'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination controls */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {pageList.map(pn => (
            <button
              key={pn}
              onClick={() => setPage(pn)}
              style={{ padding: '4px 10px', background: pn === page ? '#007bff' : '#eee', color: pn === page ? '#fff' : '#23272f', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {pn}
            </button>
          ))}
        </div>
        </>}
      </div>
      {showAdd && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            <h3>Add Problem</h3>
            <div style={{ marginBottom: 12 }}>
              <input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ width: '100%', padding: 6, fontSize: 15 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <select multiple value={newTags} onChange={handleNewTagsSelect} style={{ width: '100%', minHeight: 60 }}>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value)} style={{ width: '100%' }}>
                {ALL_DIFFICULTY.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <textarea placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ width: '100%', padding: 6, fontSize: 15 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAdd(false)}>Cancel</button>
              <button onClick={handleAddProblem}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Problems; 