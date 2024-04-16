// create a mongodb database called channels_db, in users machine 

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

interface MediaEntry {
  // extinf: string;
  url: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
}

async function insertBatchOfMediaEntries(collection: any, mediaEntries: MediaEntry[]) {
  // Insert media entries into the collection
  await collection.insertMany(mediaEntries);
}

export default async function createDatabase(req: NextApiRequest, res: NextApiResponse) {
  const { mediaEntries }: { mediaEntries: MediaEntry[] } = req.body;

  if (!mediaEntries || !Array.isArray(mediaEntries) || mediaEntries.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty media entries list' });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI as string, {});
    const db = client.db(process.env.DATABASE_NAME);

    // Check if the database and collection exist
    const collections = await db.listCollections({ name: 'channels' }).toArray();
    const databaseExists = collections.length > 0;

    if (!databaseExists) {
      // Database does not exist, create it
      await db.createCollection('channels');
    }

    // Create a collection named 'channels' if it does not exist
    const collection = db.collection('channels');

    // Insert media entries into the collection
    await insertBatchOfMediaEntries(collection, mediaEntries);

    // Close the MongoDB connection
    await client.close();

    res.status(200).json({ message: 'Database created', insertedCount: mediaEntries.length });
  } catch (error) {
    console.error('Error creating database:', error);
    res.status(500).json({ error: 'Error creating database' });
  }
}
