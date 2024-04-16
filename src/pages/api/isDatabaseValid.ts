import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

async function isDatabaseValid(): Promise<boolean> {
  try {
    // Connect to the MongoDB server
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);

    // Get the admin database
    const adminDb = client.db('admin');

    // Check if the database exists
    const databases = await adminDb.admin().listDatabases();
    const databaseExists = databases.databases.some(db => db.name === process.env.DATABASE_NAME);

    if (!databaseExists) {
      // Database doesn't exist, return false
      await client.close();
      return false;
    }

    // Get the database
    const db = client.db(process.env.DATABASE_NAME);

    // Check if the collection exists
    const collectionExists = await db.listCollections({ name: "channels" }).hasNext();

    if (!collectionExists) {
      // Collection doesn't exist, return false
      await client.close();
      return false;
    }

    // Get the collection
    const collection = db.collection("channels");

    // Count the documents in the collection
    const documentCount = await collection.countDocuments();

    // Close the MongoDB connection
    await client.close();

    // Return true if there are more than 0 documents, false otherwise
    return documentCount > 0;
  } catch (error) {
    console.error('Error checking database validity:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isValid = await isDatabaseValid();
    res.status(200).json({ isValid });
  } catch (error) {
    console.error('Error checking database validity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
