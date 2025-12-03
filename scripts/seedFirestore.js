/* eslint-disable */
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedSubjects() {
  const subjects = [
    // Kelas 6
    { name: 'Matematika', grade: 6, order: 1 },
    { name: 'IPA', grade: 6, order: 2 },
    { name: 'IPS', grade: 6, order: 3 },
    { name: 'Bahasa Indonesia', grade: 6, order: 4 },
    { name: 'PKN', grade: 6, order: 5 },
    // Kelas 3
    { name: 'Matematika', grade: 3, order: 1 },
    { name: 'IPA', grade: 3, order: 2 },
    { name: 'IPS', grade: 3, order: 3 },
    { name: 'Bahasa Indonesia', grade: 3, order: 4 },
    { name: 'PKN', grade: 3, order: 5 }
  ];

  const batch = db.batch();
  
  subjects.forEach(subject => {
    const docRef = db.collection('subjects').doc();
    batch.set(docRef, {
      ...subject,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log('✅ Subjects seeded');
}

async function seedTopics() {
  // Get Math Grade 6 subject
  const mathGrade6 = await db.collection('subjects')
    .where('name', '==', 'Matematika')
    .where('grade', '==', 6)
    .limit(1)
    .get();
  
  if (mathGrade6.empty) {
    console.log('❌ Math Grade 6 subject not found, skipping topics');
    return;
  }

  const subjectId = mathGrade6.docs[0].id;
  
  const topics = [
    {
      subjectId,
      name: 'Bilangan Bulat',
      description: 'Operasi hitung bilangan bulat positif dan negatif',
      order: 1
    },
    {
      subjectId,
      name: 'Pecahan dan Desimal',
      description: 'Operasi hitung pecahan, desimal, dan persen',
      order: 2
    },
    {
      subjectId,
      name: 'Geometri dan Pengukuran',
      description: 'Bangun datar, bangun ruang, luas, volume',
      order: 3
    }
  ];

  const batch = db.batch();
  
  topics.forEach(topic => {
    const docRef = db.collection('topics').doc();
    batch.set(docRef, {
      ...topic,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log('✅ Topics seeded');
}

async function main() {
  try {
    await seedSubjects();
    await seedTopics();
    console.log('✅ Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
}

main();
