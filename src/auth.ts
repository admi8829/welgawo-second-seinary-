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

// Status Messenger
const statusMessage = document.getElementById('statusMessage');
const statusIcon = document.getElementById('statusIcon');
const statusTitle = document.getElementById('statusTitle');
const statusDesc = document.getElementById('statusDesc');

function showStatus(type: 'success' | 'error', title: string, desc: string) {
  if (!statusMessage || !statusIcon || !statusTitle || !statusDesc) return;
  
  statusMessage.classList.remove('hidden', 'bg-green-50', 'border-green-100', 'bg-red-50', 'border-red-100');
  statusIcon.classList.remove('bg-green-500', 'text-white', 'bg-red-500', 'text-white');
  
  if (type === 'success') {
    statusMessage.classList.add('bg-green-50', 'border-green-100');
    statusIcon.classList.add('bg-green-500', 'text-white');
    statusIcon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
  } else {
    statusMessage.classList.add('bg-red-50', 'border-red-100');
    statusIcon.classList.add('bg-red-500', 'text-white');
    statusIcon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  }
  
  statusTitle.textContent = title;
  statusDesc.textContent = desc;
  statusMessage.classList.remove('hidden');
}

function updateUI() {
  const activeBtn = "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-white shadow-sm text-slate-900 transition-all";
  const inactiveBtn = "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all";

  if (mode === 'signup') {
    signInBox?.classList.add('hidden');
    signUpBox?.classList.remove('hidden');
    if (tabSignUp) tabSignUp.className = activeBtn;
    if (tabSignIn) tabSignIn.className = inactiveBtn;
  } else {
    signUpBox?.classList.add('hidden');
    signInBox?.classList.remove('hidden');
    if (tabSignIn) tabSignIn.className = activeBtn;
    if (tabSignUp) tabSignUp.className = inactiveBtn;
  }
  // Clear status on switch
  statusMessage?.classList.add('hidden');
}

// Ensure UI updates on resize to handle hidden/visible boxes correctly
window.addEventListener('resize', updateUI);

// Photo Handling
if (photoInput) {
  photoInput.addEventListener('change', (e) => {
    const file = photoInput.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) { // 1.5MB Limit
        showStatus('error', 'Profile Size Error', 'The selected portrait is too large (max 1.5MB).');
        photoInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (re) => {
        selectedPhotoBase64 = re.target?.result as string;
        showStatus('success', 'Portrait Loaded', 'Your scholar photo has been processed successfully.');
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
    const phone = (document.getElementById('phoneInput') as HTMLInputElement).value;
    const password = (document.getElementById('passwordInput') as HTMLInputElement).value;
    const confirm = (document.getElementById('confirmPasswordInput') as HTMLInputElement).value;
    
    if (password !== confirm) {
      showStatus('error', 'Password Mismatch', 'Your confirmation password does not match.');
      return;
    }

    const gender = (document.getElementById('genderInput') as HTMLSelectElement).value;
    const age = parseInt((document.getElementById('ageInput') as HTMLInputElement).value) || 18;
    const grade = (document.getElementById('gradeInput') as HTMLSelectElement).value;
    const schoolName = (document.getElementById('schoolInput') as HTMLInputElement).value;

    try {
      btn.disabled = true;
      btn.textContent = 'Establishing Identity...';
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, gender, age, grade, schoolName, photo: selectedPhotoBase64 })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        showStatus('success', 'Academy Join Successful', 'Redirecting you to your intelligence dashboard...');
        btn.textContent = 'Identity Confirmed';
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        showStatus('error', 'Registration Refused', data.message || 'The academy could not confirm your registration at this time.');
        btn.disabled = false;
        btn.textContent = 'Establish Student Identity';
      }
    } catch (error: any) {
      showStatus('error', 'System Connection Error', 'Failed to communicate with our servers: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Establish Student Identity';
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
        btn.textContent = 'Success! Redirecting...';
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
        window.location.href = '/';
      } else {
        alert(data.message);
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    } catch (error: any) {
      alert('Sign in failed: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

updateUI();
