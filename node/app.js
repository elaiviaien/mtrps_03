const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URL || "mongodb://mongo:27017";

app.get("/", async (req, res) => {
  const client = new MongoClient(mongoUrl);
  try {
    await client.connect();
    const db = client.db("testdb");
    const collection = db.collection("test");
    await collection.insertOne({ time: new Date() });
    const count = await collection.countDocuments();
    res.send(`Connected to MongoDB. Total documents: ${count}`);
  } catch (err) {
    res.status(500).send("MongoDB connection failed");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
