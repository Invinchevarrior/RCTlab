import axios from 'axios';

const judge0 = axios.create({
  baseURL: import.meta.env.VITE_JUDGE0_URL,
  headers: {
    'X-RapidAPI-Host': import.meta.env.VITE_JUDGE0_HOST,
    'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY
  }
});

export const submitCode = async (sourceCode, languageId, stdin) => {
  const { data } = await judge0.post('/submissions', {
    source_code: btoa(sourceCode),
    language_id: languageId,
    stdin: btoa(stdin),
    wait: false
  });
  return data.token;
};

export const getResult = async (token) => {
  const { data } = await judge0.get(`/submissions/${token}`, {
    params: { base64_encoded: true }
  });
  
  return {
    stdout: data.stdout ? atob(data.stdout) : '',
    stderr: data.stderr ? atob(data.stderr) : data.compile_output ? atob(data.compile_output) : '',
    time: data.time,
    memory: data.memory,
    status: {
      id: data.status.id,
      description: data.status.description
    }
  };
};
