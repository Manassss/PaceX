// seedMarketplace.js

require("dotenv").config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Marketplace = require('./models/Market'); // adjust path if needed
const User = require('./models/Userdetails');   // adjust path if needed

// Use your connection string (possibly from an environment variable)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/your-db-name';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB Connected to Database: ${mongoose.connection.name}`);
    seedMarketplace(); // Start seeding once connected
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  });

async function seedMarketplace() {
  try {
    // Retrieve all users from the database
    const users = await User.find();
    if (!users.length) {
      throw new Error("No users found in the database. Please seed users first.");
    }
    console.log(`Found ${users.length} users for auto-posting.`);

    // Create 200 marketplace entries
    for (let i = 0; i < 200; i++) {
      // Select a random user from the database
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Create a new marketplace entry using Faker for dummy data
      const newEntry = new Marketplace({
        userId: randomUser._id,
        itemName: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        imageUrl: faker.image.urlLoremFlickr({ width: 800, height: 600, category: "nature", randomize: true }),
        address: faker.address.streetAddress(),
        category: faker.commerce.department(),
        subcategory: faker.commerce.productAdjective()
      });

      await newEntry.save();
      console.log(`Created marketplace entry ${i + 1}:`, newEntry.itemName);
    }

    console.log("✅ Marketplace seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating marketplace entries:", error);
    process.exit(1);
  }
}
