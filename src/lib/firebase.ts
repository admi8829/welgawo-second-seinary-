// Mock Auth implementation using LocalStorage
export function onAuthStateChanged(auth: any, callback: (user: any) => void) {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    callback(JSON.parse(userStr));
  } else {
    callback(null);
  }
}

export function signOut(auth: any) {
  localStorage.removeItem('currentUser');
  window.location.href = '/';
}

export const auth = {};
export const db = {};
