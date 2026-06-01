// Replace with your Supabase credentials
const SUPABASE_URL = "https://vogcotscoefeuvsniixw.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZ2NvdHNjb2VmZXV2c25paXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTAwODgsImV4cCI6MjA5NTg2NjA4OH0.qRtM9trP4PXFupkII6IselQU-l2YclEzplsljnKMfqU";

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Custom alphabet for short IDs (no ambiguous chars: 0, O, o, 1, l, I)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";

function generateShortId(length = 12) {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return id;
}

function getExpirationDate(option) {
  const now = new Date();
  switch (option) {
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "1d":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "1w":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "never":
      return null;
    default:
      return null;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showToast(message, type = "success") {
  const container = document.createElement("div");
  container.className = "toast-container";
  container.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-body">${message}</div>
        </div>
    `;
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3000);
}
