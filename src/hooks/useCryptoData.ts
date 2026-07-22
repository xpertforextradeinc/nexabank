import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCryptoData = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/crypto');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch crypto data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
