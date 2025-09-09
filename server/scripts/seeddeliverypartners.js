// server/scripts/seeddeliverypartner.js
require('dotenv').config();
const mongoose = require('mongoose');
const Rider = require('../models/Rider');

const MONGO = process.env.MONGODB_URI;
if (!MONGO) { console.error('MONGODB_URI missing'); process.exit(1); }

const riders = [
  { username: 'rider1', password: 'pass1', name: 'Raj Sharma' },
  { username: 'rider2', password: 'pass2', name: 'Vikram Singh' },
  { username: 'rider3', password: 'pass3', name: 'Sunil Kumar' },
  // add more if needed
];

async function seed() {
  await mongoose.connect(MONGO);
  console.log('Connected to DB for seeding riders');

  for (const r of riders) {
    const exists = await Rider.findOne({ username: r.username });
    if (!exists) {
      await Rider.create(r);
      console.log('Seeded:', r.username);
    } else {
      console.log('Already exists:', r.username);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
