import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function check() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("No DATABASE_URL in .env");
    return;
  }
  
  console.log("Connecting to DB...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('test'); // Or whatever the DB uses default
  
  // Find collections
  const collections = await db.listCollections().toArray();
  const userColName = collections.find(c => c.name.toLowerCase().includes('user'))?.name;
  
  if (userColName) {
    const users = await db.collection(userColName).find({}).toArray();
    console.log("Users in DB:", users.map(u => ({ email: u.email, role: u.role })));
  } else {
    console.log("No user collection found.");
  }
  await client.close();

  // Test SMTP
  console.log("\nTesting SMTP Connection...");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("SMTP Connection successful!");
  } catch (error) {
    console.error("SMTP Error:", error.message);
  }
}

check().catch(console.error);
