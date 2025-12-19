// Usage: node scripts/generateToken.cjs <userId>
// Uses JWT_SECRET from your .env

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const userId = process.argv[2];

if (!userId) {
  console.error("Please provide a userId: node scripts/generateToken.cjs <userId>");
  process.exit(1);
}

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("JWT_SECRET is not set in server/.env");
  process.exit(1);
}

const token = jwt.sign({ id: userId }, secret, { expiresIn: "30d" });
console.log("JWT token:");
console.log(token);




