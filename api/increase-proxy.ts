import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const INCREASE_API_URL = process.env.INCREASE_API_URL || 'https://api.increase.com';
  const INCREASE_API_KEY = process.env.INCREASE_API_KEY;

  if (!INCREASE_API_KEY) {
    return res.status(500).json({ error: 'INCREASE_API_KEY is not configured.' });
  }

  // Allow proxying different methods
  const { endpoint, payload, method = 'POST' } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  try {
    const config = {
      method: method as string,
      url: `${INCREASE_API_URL}/${endpoint}`,
      data: payload,
      headers: {
        'Authorization': `Bearer ${INCREASE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await axios(config);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Increase API Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json(error.response?.data || { error: 'Increase API request failed' });
  }
}
