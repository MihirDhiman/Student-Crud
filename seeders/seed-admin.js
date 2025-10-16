import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';

async function seedAdmin() {
  console.log('Connecting to database...');

  // Check DB connection
  db.connect((err) => {
    if (err) {
      console.error(' Database connection failed:', err.message);
      process.exit(1);
    }
  });

  const adminName = 'Super Admin';
  const adminEmail = 'admin@college.com';
  const adminPassword = 'Admin@123';


  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log('Checking if admin already exists');
  db.query(
    'SELECT * FROM college_authority WHERE email = ?',
    [adminEmail],
    (err, results) => {
      if (err) {
        console.error(' Error checking admin:', err.message);
        process.exit(1);
      }

      if (results.length > 0) {
        console.log('Admin already exists:', adminEmail);
        process.exit(0);
      }

      console.log('Creating new admin...');
      db.query(
        'INSERT INTO college_authority (name, email, password) VALUES (?, ?, ?)',
        [adminName, adminEmail, hashedPassword],
        (err) => {
          if (err) {
            console.error('Error inserting admin:', err.message);
            process.exit(1);
          }
          console.log('Admin created successfully!');
          console.log('----------------------------');
          console.log(`Email: ${adminEmail}`);
          console.log(`Password: ${adminPassword}`);
          console.log('----------------------------');
          process.exit(0);
        }
      );
    }
  );
}

seedAdmin();
