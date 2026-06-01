// Replace with your Supabase credentials
const SUPABASE_URL = "https://vogcotscoefeuvsniixw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZ2NvdHNjb2VmZXV2c25paXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTAwODgsImV4cCI6MjA5NTg2NjA4OH0.qRtM9trP4PXFupkII6IselQU-l2YclEzplsljnKMfqU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Custom alphabet - removed ambiguous: 0, O, o, 1, l, I
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

function generateShortId(length) {
    let id = '';
    for (let i = 0; i < length; i++) {
        id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return id;
}

// Generate unique short ID with collision check
async function generateUniqueShortId(length) {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const id = generateShortId(length);
        
        // Check if ID already exists
        const { data, error } = await db
            .from('pastes')
            .select('short_id')
            .eq('short_id', id)
            .single();
        
        // If no data found, ID is available
        if (!data) {
            return id;
        }
        
        attempts++;
    }
    
    // Fallback: try with longer ID if too many collisions
    return generateShortId(length + 2);
}

function getExpirationDate(option) {
    const now = new Date();
    switch (option) {
        case '1h': return new Date(now.getTime() + 60 * 60 * 1000);
        case '1d': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case '1w': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'never': return null;
        default: return null;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function showToast(message) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.innerHTML = '<div class="toast show" role="alert"><div class="toast-body">' + message + '</div></div>';
    document.body.appendChild(container);
    setTimeout(function() { container.remove(); }, 3000);
}
