import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set (32+ chars). See .env.example');
  process.exit(1);
}

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Ovrload API on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
