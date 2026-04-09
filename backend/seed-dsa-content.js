// Quick script to seed the comprehensive DSA content
const jwt = require("jsonwebtoken");
const http = require("http");

const NEXTAUTH_SECRET = "58c6abb5a1c47b1872ea8b43a1963fd2";

// Create admin JWT token
const token = jwt.sign(
  {
    email: "admin@example.com",
    role: "ADMIN",
  },
  NEXTAUTH_SECRET,
  { expiresIn: "1h" },
);

console.log("✅ Generated JWT Token:");
console.log(token);
console.log("\n📍 Using this token to seed...\n");

// Make POST request to seed endpoint
const options = {
  hostname: "localhost",
  port: 3001,
  path: "/api/admin/learn/seed-comprehensive",
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Content-Length": 0,
  },
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("\n✅ SEEDING SUCCESSFUL!\n");
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("\n❌ ERROR Response:\n");
      console.log(data);
    }
  });
});

req.on("error", (e) => {
  console.error(`❌ REQUEST ERROR: ${e.message}`);
});

req.end();
