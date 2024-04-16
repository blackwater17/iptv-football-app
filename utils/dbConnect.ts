import { MongoClient, Db } from 'mongodb';

const uri: string = "mongodb://localhost:27017";
const options: any = {};

let client: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
     return cachedDb;
  }

  if (!client) {
    client = await MongoClient.connect(uri, options);
  }

  const db: Db = client.db(process.env.DATABASE_NAME);
  cachedDb = db;
  return db;
}
