require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

// Import your database connection and models
const connectDB = require("./config/db");
const User = require("./models/Userdetails");
const Post = require("./models/Post");
const Story = require("./models/Story");

// Connect to the DB
connectDB()
  .then(() => {
    console.log("✅ Connected to DB for auto posting");
    // Start the auto-posting after connection.
    startAutoPosting();
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });

/**
 * Picks a random element from an array.
 * @param {Array} arr 
 * @returns A random element from the array.
 */
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Creates a random post from a random user.
 */
async function createRandomPost(users) {
  try {
    // Pick a random user
    const randomUser = randomElement(users);
    if (!randomUser) {
      console.warn("No users available for posting.");
      return;
    }
    
    // Create random content
    const postData = {
      userId: randomUser._id,
      userName: randomUser.name,
      content: faker.lorem.paragraph(),
      // Use faker.image.urlLoremFlickr with options
      postimg: faker.image.urlLoremFlickr({ width: 800, height: 600, category: "nature", randomize: true }),
      images: [faker.image.urlLoremFlickr({ width: 800, height: 600, category: "nature", randomize: true })],
      likes: [],
      dislikes: [],
      archived: false,
      tempdelete: false,
      shares: faker.datatype.number({ min: 0, max: 100 }),
      createdAt: new Date()
    };

    const post = await Post.create(postData);
    console.log(`✅ Post created for user ${randomUser.name}: ${post._id}`);
  } catch (err) {
    console.error("Error creating post:", err.message);
  }
}

/**
 * Creates a random story from a random user.
 */
async function createRandomStory(users) {
  try {
    // Pick a random user
    const randomUser = randomElement(users);
    if (!randomUser) {
      console.warn("No users available for story.");
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // story expires in 24 hours

    const storyData = {
      userId: randomUser._id,
      userName: randomUser.name,
      // Use faker.image.urlLoremFlickr for story image
      mediaUrl: faker.image.urlLoremFlickr({ width: 800, height: 600, category: "tech", randomize: true }),
      mediaType: "image",
      views: [],
      viewsNumber: 0,
      expiresAt: expiresAt,
      createdAt: now
    };

    const story = await Story.create(storyData);
    console.log(`✅ Story created for user ${randomUser.name}: ${story._id}`);
  } catch (err) {
    console.error("Error creating story:", err.message);
  }
}

/**
 * Main function to start auto-posting.
 */
async function startAutoPosting() {
  try {
    // Load all users from the database once
    const users = await User.find({});
    console.log(`Found ${users.length} users for auto-posting.`);

    // Function to create a post and a story
    const autoCreate = async () => {
      console.log("📢 Auto posting started at", new Date().toLocaleString());
      await createRandomPost(users);
      await createRandomStory(users);
      console.log("📢 Auto posting completed at", new Date().toLocaleString());
    };

    // Set an interval for every 30 minutes (1800000 milliseconds)
    setInterval(autoCreate, 1800000);

    // Optionally, call it immediately on start
    await autoCreate();
  } catch (err) {
    console.error("Error in auto posting setup:", err);
  }
}
