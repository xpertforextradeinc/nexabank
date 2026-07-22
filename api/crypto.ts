import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false
      },
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
      }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
}
