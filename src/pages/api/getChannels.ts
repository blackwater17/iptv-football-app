import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/dbConnect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { text } = req.query as { text: string };
    const db = await connectToDatabase();
    const collection = db.collection('channels');

    const query = {
      'tvgName': { $regex: new RegExp(text, 'i') } // Case-insensitive search
    };
    let channels = await collection.find(query).limit(1000).toArray();

    channels.forEach((c: any) => {
      c["tvgName"] = c["tvgName"].replace(/⚽/g, 'O');
    });

    res.status(200).json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
