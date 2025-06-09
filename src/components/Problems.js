import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

// 示例题库数据
const PROBLEM_LIST = [
  {
    id: 1,
    title: 'Two Sum',
    tags: ['Array', 'Hash Table'],
    difficulty: 'Easy',
    status: '',
    favorite: false,
  },
  {
    id: 2,
    title: 'Add Two Numbers',
    tags: ['Linked List', 'Math'],
    difficulty: 'Medium',
    status: '',
    favorite: false,
  },
  {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    difficulty: 'Medium',
    status: '',
    favorite: false,
  },
  {
    id: 4,
    title: 'Median of Two Sorted Arrays',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    difficulty: 'Hard',
    status: '',
    favorite: false,
  },
];

const ALL_TAGS = Array.from(new Set(PROBLEM_LIST.flatMap(p => p.tags)));
const ALL_DIFFICULTY = ['Easy', 'Medium', 'Hard'];

function Problems() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [problems, setProblems] = useState(PROBLEM_LIST);
  const history = useHistory();

  // 收藏/标记
  const toggleFavorite = (id) => {
    setProblems(problems.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
  };
  const toggleStatus = (id, status) => {
    setProblems(problems.map(p => p.id === id ? { ...p, status } : p));
  };

  // 搜索与筛选
  const filtered = problems.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (!tag || p.tags.includes(tag)) &&
    (!difficulty || p.difficulty === difficulty)
  );

  return (
    <div style={{ padding: 32 }}>
      <h2>Problems</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <input
          placeholder="Search by title"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 6, fontSize: 15 }}
        />
        <select value={tag} onChange={e => setTag(e.target.value)}>
          <option value="">All Tags</option>
          {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
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
          {filtered.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}>
              <td style={{ padding: 8 }}>{p.id}</td>
              <td onClick={() => history.push(`/problems/${p.id}`)} style={{ color: '#007bff', textDecoration: 'underline' }}>{p.title}</td>
              <td>{p.tags.join(', ')}</td>
              <td>{p.difficulty}</td>
              <td>
                <select value={p.status} onChange={e => toggleStatus(p.id, e.target.value)}>
                  <option value="">None</option>
                  <option value="Solved">Solved</option>
                  <option value="Unsolved">Unsolved</option>
                  <option value="Hard">Hard</option>
                </select>
              </td>
              <td>
                <button onClick={() => toggleFavorite(p.id)} style={{ color: p.favorite ? '#f39c12' : '#888', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {p.favorite ? '★' : '☆'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Problems; 