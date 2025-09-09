// Sample Users Data
// Run this script in MongoDB to add sample users

db.users.insertMany([
  {
    username: "admin",
    email: "admin@mangareader.com",
    password: "admin123",
    role: "admin",
    createdAt: new Date(),
    active: true
  },
  {
    username: "author1",
    email: "author1@mangareader.com", 
    password: "author123",
    role: "author",
    createdAt: new Date(),
    active: true
  },
  {
    username: "author2",
    email: "author2@mangareader.com",
    password: "author123", 
    role: "author",
    createdAt: new Date(),
    active: true
  },
  {
    username: "user1",
    email: "user1@mangareader.com",
    password: "user123",
    role: "user", 
    createdAt: new Date(),
    active: true
  },
  {
    username: "user2",
    email: "user2@mangareader.com",
    password: "user123",
    role: "user",
    createdAt: new Date(),
    active: true
  },
  {
    username: "user3",
    email: "user3@mangareader.com",
    password: "user123",
    role: "user",
    createdAt: new Date(),
    active: false
  }
]);

// Verify the data was inserted
db.users.find().pretty();

// Count users by role
db.users.aggregate([
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 }
    }
  }
]);
