let mode: 'signin' | 'signup' = 'signin';

// Elements
const tabSignIn = document.getElementById('tabSignIn') as HTMLButtonElement;
const tabSignUp = document.getElementById('tabSignUp') as HTMLButtonElement;
const signInBox = document.getElementById('signInBox') as HTMLElement;
const signUpBox = document.getElementById('signUpBox') as HTMLElement;
const signInForm = document.getElementById('signInForm') as HTMLFormElement;
const signUpForm = document.getElementById('signUpForm') as HTMLFormElement;
const switchSignIn = document.getElementById('switchSignIn') as HTMLButtonElement;
const switchSignUp = document.getElementById('switchSignUp') as HTMLButtonElement;
const photoInput = document.getElementById('photoInput') as HTMLInputElement;

let selectedPhotoBase64 = '';

// Check URL mode
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('mode') === 'signup') mode = 'signup';

function updateUI() {
  const activeTabClass = "text-xs font-black uppercase tracking-[0.2em] text-blue-600 border-b-2 border-blue-600 pb-2 transition-all duration-300";
  const inactiveTabClass = "text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all duration-300 pb-2";

  if (mode === 'signup') {
    // On mobile we toggle, on desktop we can highlight
    if (window.innerWidth < 1024) {
      signInBox?.classList.add('hidden');
      signUpBox?.classList.remove('hidden');
      if (document.getElementById('illustrationBox')) {
        document.getElementById('illustrationBox')!.classList.add('hidden');
      }
    } else {
      signInBox?.classList.remove('hidden', 'opacity-50');
      signUpBox?.classList.remove('hidden', 'opacity-50');
      signInBox?.classList.add('opacity-30', 'scale-95', 'pointer-events-none');
      signUpBox?.classList.remove('opacity-30', 'scale-95', 'pointer-events-none');
      if (document.getElementById('illustrationBox')) {
        document.getElementById('illustrationBox')!.classList.remove('hidden');
      }
    }
    if (tabSignUp) tabSignUp.className = activeTabClass;
    if (tabSignIn) tabSignIn.className = inactiveTabClass;
  } else {
    if (window.innerWidth < 1024) {
      signUpBox?.classList.add('hidden');
      signInBox?.classList.remove('hidden');
      if (document.getElementById('illustrationBox')) {
        document.getElementById('illustrationBox')!.classList.add('hidden');
      }
    } else {
      signInBox?.classList.remove('hidden', 'opacity-30', 'scale-95', 'pointer-events-none');
      signUpBox?.classList.remove('hidden');
      signUpBox?.classList.add('opacity-30', 'scale-95', 'pointer-events-none');
      if (document.getElementById('illustrationBox')) {
        document.getElementById('illustrationBox')!.classList.remove('hidden');
      }
    }
    if (tabSignIn) tabSignIn.className = activeTabClass;
    if (tabSignUp) tabSignUp.className = inactiveTabClass;
  }
}

// Ensure UI updates on resize to handle hidden/visible boxes correctly
window.addEventListener('resize', updateUI);

// Photo Handling
if (photoInput) {
  photoInput.addEventListener('change', (e) => {
    const file = photoInput.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
        alert("Image too large. Please select a file under 1MB.");
        photoInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (re) => {
        selectedPhotoBase64 = re.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Switches
if (tabSignIn) tabSignIn.onclick = () => { mode = 'signin'; updateUI(); };
if (tabSignUp) tabSignUp.onclick = () => { mode = 'signup'; updateUI(); };
if (switchSignIn) switchSignIn.onclick = () => { mode = 'signin'; updateUI(); };
if (switchSignUp) switchSignUp.onclick = () => { mode = 'signup'; updateUI(); };

// Create Account Submit
if (signUpForm) {
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSignUp') as HTMLButtonElement;
    const name = (document.getElementById('nameInput') as HTMLInputElement).value;
    const email = (document.getElementById('emailInput') as HTMLInputElement).value;
    const password = (document.getElementById('passwordInput') as HTMLInputElement).value;
    const confirm = (document.getElementById('confirmPasswordInput') as HTMLInputElement).value;
    
    if (password !== confirm) {
      alert("Passwords don't match!");
      return;
    }

    const gender = (document.getElementById('genderInput') as HTMLSelectElement).value;
    const age = parseInt((document.getElementById('ageInput') as HTMLInputElement).value) || 18;
    const grade = (document.getElementById('gradeInput') as HTMLSelectElement).value;
    const schoolName = (document.getElementById('schoolInput') as HTMLInputElement).value;

    try {
      btn.disabled = true;
      btn.textContent = 'Registering...';
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, gender, age, grade, schoolName, photo: selectedPhotoBase64 })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        alert(data.message);
      }
    } catch (error: any) {
      alert('Registration failed: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Register';
    }
  });
}

// Sign In Submit
if (signInForm) {
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSignIn') as HTMLButtonElement;
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;

    try {
      btn.disabled = true;
      btn.textContent = 'Signing in...';
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        alert(data.message);
      }
    } catch (error: any) {
      alert('Sign in failed: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

updateUI();
