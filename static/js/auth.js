// Firebase Configuration is dynamically loaded from .env via meta/script inject
const firebaseConfig = window.FIREBASE_CONFIG || {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

// Initialize Firebase
if (typeof firebase === 'undefined') {
  console.error("❌ Firebase SDK not loaded");
} else if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized");
  } catch (e) {
    console.error("❌ Firebase initialization error", e);
  }
}

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

// Update Navbar based on Auth State
if (auth) {
  auth.onAuthStateChanged((user) => {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    if (user) {
      navAuth.innerHTML = `
      <div class="flex items-center gap-4">
        <span class="text-sm font-mono text-zinc-500">Hi, <span class="text-[#00ffa3] font-bold">${user.displayName || user.email.split('@')[0]}</span></span>
        <button onclick="logout()" class="text-sm font-bold text-red-500 hover:text-red-400 transition-colors">Logout</button>
      </div>
    `;
    } else {
      navAuth.innerHTML = `
      <a href="/login" class="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Login</a>
      <a href="/signup" class="bg-gradient-to-r from-[#00ffa3] to-emerald-600 text-black px-6 py-2 rounded-lg text-sm font-black hover:scale-[1.05] transition-all">Sign Up</a>
    `;
    }
  });
}

async function logout() {
  if (auth) {
    await firebase.auth().signOut();
    window.location.href = '/login';
  }
}
window.logout = logout;
