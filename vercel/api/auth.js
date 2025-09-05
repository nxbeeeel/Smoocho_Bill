// Vercel API route: /api/auth/login
// File: vercel-api-routes/auth.js

const { db, auth } = require('../firebase-vercel-config');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check user in Firestore
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // In a real app, you'd hash and compare passwords
    if (userData.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create custom token for Firebase Auth
    const customToken = await auth.createCustomToken(userDoc.id, {
      role: userData.role || 'admin'
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userData;

    res.status(200).json({
      token: customToken,
      user: {
        id: userDoc.id,
        ...userWithoutPassword
      },
      expiresIn: 3600 // 1 hour
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
