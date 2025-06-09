import React from 'react';
import { useParams, useHistory } from 'react-router-dom';

// 示例题库数据（与 Problems.js 保持一致）
const PROBLEM_MAP = {
  1: {
    id: 1,
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    input: 'nums = [2,7,11,15], target = 9',
    output: '[0,1]',
    sample: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    tags: ['Array', 'Hash Table'],
    difficulty: 'Easy',
    limit: '1 <= nums.length <= 10^4',
  },
  2: {
    id: 2,
    title: 'Add Two Numbers',
    description: 'You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.',
    input: 'l1 = [2,4,3], l2 = [5,6,4]',
    output: '[7,0,8]',
    sample: 'Input: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [7,0,8]\nExplanation: 342 + 465 = 807.',
    tags: ['Linked List', 'Math'],
    difficulty: 'Medium',
    limit: '1 <= l1.length, l2.length <= 100',
  },
  3: {
    id: 3,
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    input: 's = "abcabcbb"',
    output: '3',
    sample: 'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    difficulty: 'Medium',
    limit: '0 <= s.length <= 5 * 10^4',
  },
  4: {
    id: 4,
    title: 'Median of Two Sorted Arrays',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    input: 'nums1 = [1,3], nums2 = [2]',
    output: '2.0',
    sample: 'Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.0',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    difficulty: 'Hard',
    limit: '1 <= m, n <= 1000',
  },
};

function ProblemDetail() {
  const { id } = useParams();
  const history = useHistory();
  const problem = PROBLEM_MAP[id];

  if (!problem) return <div style={{ padding: 32 }}>Problem not found.</div>;

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => history.push('/problems')} style={{ marginBottom: 16 }}>&lt; Back to Problems</button>
      <h2>{problem.title}</h2>
      <div style={{ margin: '12px 0', color: '#888' }}>
        <b>Difficulty:</b> {problem.difficulty} &nbsp; | &nbsp;
        <b>Tags:</b> {problem.tags.join(', ')}
      </div>
      <div style={{ margin: '16px 0' }}><b>Description:</b><br />{problem.description}</div>
      <div style={{ margin: '8px 0' }}><b>Input:</b> {problem.input}</div>
      <div style={{ margin: '8px 0' }}><b>Output:</b> {problem.output}</div>
      <div style={{ margin: '8px 0' }}><b>Sample:</b><br /><pre style={{ background: '#f5f5f5', padding: 8 }}>{problem.sample}</pre></div>
      <div style={{ margin: '8px 0', color: '#888' }}><b>Limit:</b> {problem.limit}</div>
    </div>
  );
}

export default ProblemDetail; 