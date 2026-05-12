import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged 
} from './lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const urlParams = new URLSearchParams(window.location.search);
let mode = urlParams.get('mode') === 'signup' ? 'signup' : 'signin';

const authTitle = document.getElementById('authTitle') as HTMLElement;
const authSubtitle = document.getElementById('authSubtitle') as HTMLElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const toggleMode = document.getElementById('toggleMode') as HTMLButtonElement;
const toggleText = document.getElementById('toggleText') as HTMLElement;
const nameGroup = document.getElementById('nameGroup') as HTMLElement;
const gradeGroup = document.getElementById('gradeGroup') as HTMLElement;
const authForm = document.getElementById('authForm') as HTMLFormElement;
const googleBtn = document.getElementById('googleBtn') as HTMLButtonElement;

function updateUI() {
  if (mode === 'signup') {
    authTitle.innerText = 'Create Account';
    authSubtitle.innerText = 'Join the elite community of scholars.';
    submitBtn.innerText = 'Create Account';
    toggleText.innerText = 'Already have an account?';
    toggleMode.innerText = 'Sign In';
    nameGroup.classList.remove('hidden');
    gradeGroup.classList.remove('hidden');
  } else {
    authTitle.innerText = 'Welcome Back';
    authSubtitle.innerText = 'Continue your journey to excellence.';
    submitBtn.innerText = 'Sign In';
    toggleText.innerText = "Don't have an account?";
    toggleMode.innerText = 'Create Account';
    nameGroup.classList.add('hidden');
    gradeGroup.classList.add('hidden');
  }
}

updateUI();

toggleMode.addEventListener('click', () => {
  mode = mode === 'signup' ? 'signin' : 'signup';
  updateUI();
});

async function syncUserProfile(user: any, name?: string, grade?: string) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: name || user.displayName || 'Student',
      email: user.email,
      photoURL: user.photoURL || '',
      grade: grade || '12',
      createdAt: serverTimestamp()
    });
  }
}

googleBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    window.location.href = '/';
  } catch (error: any) {
    alert('Google sign-in failed: ' + error.message);
  }
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = (document.getElementById('emailInput') as HTMLInputElement).value;
  const password = (document.getElementById('passwordInput') as HTMLInputElement).value;
  const name = (document.getElementById('emailName') as HTMLInputElement).value;
  const grade = (document.getElementById('gradeInput') as HTMLSelectElement).value;

  submitBtn.disabled = true;
  submitBtn.innerText = 'Processing...';

  try {
    if (mode === 'signup') {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await syncUserProfile(result.user, name, grade);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    window.location.href = '/';
  } catch (error: any) {
    alert('Auth error: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = mode === 'signup' ? 'Create Account' : 'Sign In';
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // If already logged in and on auth page, go home
    if (window.location.pathname.includes('auth.html')) {
        // window.location.href = '/';
    }
  }
});
