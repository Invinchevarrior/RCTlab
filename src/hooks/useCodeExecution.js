import { useState } from 'react';
import { submitCode, getResult } from '../utils/judge0';

const useCodeExecution = (languageId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const executeCode = async (code, testCases) => {
    setIsLoading(true);
    
    try {
      const tokens = await Promise.all(
        testCases.map(tc => submitCode(code, languageId, tc.input))
      );

      const interval = setInterval(async () => {
        const results = await Promise.all(tokens.map(getResult));
        setResults(results);
        
        if (results.every(r => r.status.id > 2)) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Execution error:', error);
      setIsLoading(false);
    }
  };

  return { executeCode, results, isLoading };
};
