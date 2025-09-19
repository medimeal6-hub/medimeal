const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID || "medi-826f2",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "7e72703dd4ff8f0ba5971bb61c7d83a0ea2d15d8",
  "private_key": process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2K09WGE+UGmyD\noSzxhEK7IBcBD2Ay/RJprIeU4KCDPEiQXh4o3SkqehnxrjxwrMRwYB8z4svODxj9\ngDSUL40r+sceKNCB2kvMtwq8lDu2K1Sfs92Vlquf1I3gtxMnS2ghZXuUKxJnO6qu\nXrOsEdQUJ5I0IHaeRX++uPlSlHR4zTOMfuxR2R8/aTBNgaDHgYK6KF25VZntdout\nlIXh8Sk7zac0LpV5Un7o/FHgzD38a5ldWU1GpFv1nd4EK/QQ7/pIktUY178TcT9E\n8mM0adCm0LWs5tusla9MLmtmFNG8c5WbIXULMAnD/eGuY4JV7+vQajHB/pmwJeej\n45sYyIFXAgMBAAECggEAD/SDIltGvQYDcxPux8h5v8HzwdgC6PRZZIAD7/oslNH2\n2Q4lPhcAwAOpug00pfm7ysvgb77xcr7HxYwxDrmLd8qjHfUdLgJcmTV+7z1cbXwm\nEUbDpZJovbr0IjZmqw5jtGkbBcMv/XKwZE1PF0cIeCtvFrmxKfOUWLQCwkTWXq4U\nXrc8NJcjKqhBVTF3zEnBBtBH3ff2t8KgQGGmP6OHbVdXWMw617HNai8OnEopfi6Z\nzcvaBSsrBg0PXyHUFDiorLUbZJ6yGj+Z2gaZ5/o3/zl8NwlyYeodBZPfzDn1365z\n5GcD0E09SeVN4o74aPXR6aZgrtFb0/uRw49WizyR4QKBgQDp6dJscaJ3H7OQVk3j\n3Ubmgt4ds5EJzPaGq7lnl+yI2kqndsYlR9cxa92FH/bRBXyNFgHUi55gPpMS+Jgl\nFF2lCmFHi+85OrMr1F2/g5iyu6pdmJPcIDrKvDWC9zKmTf7TF5HmXfLDD+eBwx+B\nvC1Fev79+Wmvav/rpcIK6nKf5QKBgQDHXrjbZsEakyiDW4PLSWyAt61/bn6ZxdB5\n5tVK1LtYzgg7I9OryAUnfaJr6ab2flVFK3AZPhei0Z6e+Ph1slNRnTMnbiF9ECXm\nDegh4YOD5btUqqOSCnWzKP9E1qHaXawU/AcS5keNYyhnD57aP5H/YKUTzA7/y916\nKIpd78HwiwKBgBuX5KW8RfENgU4ukCOoL7vzhiY0z5A7aH18dnOc/V8reREGNtug\n/OaslcYlfiUsI4Q1K2QaUEWEPC9JuhDttRpJ/i3FeSPkI8yw0ZpM+M9kyfUekZqv\nBqBx0VIwvP3XR485QZHOVVvjXWj2TposS57dooTtTiVOVwBCXoCRJZJtAoGADUdc\nzpgocmmswBr/SzHnvSb+skccvYc0XHooaKSEmeSXHcFEHuPim/+9KqzURwShD0tW\nWwgMsPZ/Nx1kBwrKi9wJhS3LozXJIGp6tI79oHJTqM74uAhkUHuBjQcynoWwqXEj\n03ls+JjLHxomPWkQg07fj9L+iMD+Tl2W4azPYQMCgYEAxgduF3CYifjoOHIs7hvJ\nvC7230iGbJuXwG8JtsHzWD8/jvmwHcqJxHJQs9IZuWLMTQKaHZORCOr69cKlYeE7\ndDJbdX3Uk1NEFKn3XR8brJAu89czuCeki8P7MwnJX0H8YFC4dWGFrvbLOyJZJQzv\nkmjA+dgvzI3x32CS7y+5jwA=\n-----END PRIVATE KEY-----\n",
  "client_email": process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@medi-826f2.iam.gserviceaccount.com",
  "client_id": process.env.FIREBASE_CLIENT_ID || "105808453091760655355",
  "auth_uri": process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  "token_uri": process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40medi-826f2.iam.gserviceaccount.com",
  "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || "medi-826f2"
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
  }
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = {
  admin,
  auth,
  db
};
