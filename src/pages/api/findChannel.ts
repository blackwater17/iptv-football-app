import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/dbConnect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channelName } = req.query as { channelName: string };

  try {
    const db = await connectToDatabase();
    const collection = db.collection('channels');

    // Check if any of the documents tvgName prop includes channelName (not case sensitive). returns boolean.
    const query = {
      'tvgName': { $regex: new RegExp(channelName, 'i') } // Case-insensitive search
    };
    const foundChannel = await collection.findOne(query);

    res.status(200).json({ found: !!foundChannel });
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
