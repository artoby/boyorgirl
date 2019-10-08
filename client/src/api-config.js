let backendHost;

const hostname = window && window.location && window.location.hostname;

console.log(hostname)
// if(hostname === 'boyorgirl.artoby.me') {
if (true) {
  backendHost = 'https://boyorgirl.artoby.me';
} else {
  backendHost = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:3100';
}

export const API_ROOT = `${backendHost}/api`;
console.log(API_ROOT)