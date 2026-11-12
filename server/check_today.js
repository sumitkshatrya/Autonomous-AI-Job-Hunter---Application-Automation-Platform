const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await mongoose.connection.db.collection('candidateprofiles').findOne({});
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await mongoose.connection.db.collection('applications').countDocuments({
    userId: p.userId,
    status: 'applied',
    createdAt: { $gte: startOfDay }
  });

  const s = await mongoose.connection.db.collection('automationsettings').findOne({ userId: p.userId });

  console.log('Today applied count:', todayCount);
  console.log('Daily limit:', s?.dailyApplicationLimit);
  console.log('Limit reached?', todayCount >= (s?.dailyApplicationLimit || 50));

  // Let's also inspect what jobs were applied to
  const recentApps = await mongoose.connection.db.collection('applications').find({
    userId: p.userId
  }).sort({ createdAt: -1 }).limit(10).toArray();

  console.log('Recent 10 applications:');
  for (const a of recentApps) {
    const job = await mongoose.connection.db.collection('jobs').findOne({ _id: a.jobId });
    console.log(`- Job: ${job?.title} at ${job?.company} (${job?.source}) | Status: ${a.status} | Date: ${a.createdAt}`);
  }

  await mongoose.disconnect();
}
check();

