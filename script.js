// Function to generate a simple UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to format date and time
function getFormattedDateTime() {
    const now = new Date();
    return {
        date: now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }),
        time: now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false
        }),
        timestamp: now.toISOString()
    };
}

// API Base URL - change this when deploying
const API_BASE = window.location.origin;

// Function to store vote (sends to server API)
async function storeVote(voteData) {
    try {
        const response = await fetch(`${API_BASE}/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(voteData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Vote stored successfully:', voteData);
            return { success: true, data: voteData };
        } else {
            console.error('Server error:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Network error:', error);
        // Fallback to localStorage if server is unavailable
        let votes = JSON.parse(localStorage.getItem('votes')) || [];
        votes.push(voteData);
        localStorage.setItem('votes', JSON.stringify(votes));
        console.log('Vote stored locally (offline mode):', voteData);
        return { success: true, data: voteData, offline: true };
    }
}

// Handle form submission
document.getElementById('votingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get selected values
    const leadSelection = document.querySelector('input[name="lead"]:checked');
    const coleadSelection = document.querySelector('input[name="colead"]:checked');
    
    if (!leadSelection || !coleadSelection) {
        alert('Please select one candidate for each position');
        return;
    }
    
    // Disable submit button to prevent double-click
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
    
    // Generate UUID and get timestamp
    const uuid = generateUUID();
    const dateTime = getFormattedDateTime();
    
    // Create vote object
    const voteData = {
        uuid: uuid,
        lead: leadSelection.value,
        colead: coleadSelection.value,
        input_date: dateTime.date,
        input_time: dateTime.time,
        timestamp: dateTime.timestamp
    };
    
    // Store the vote
    const result = await storeVote(voteData);
    
    if (result.success) {
        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        
        // Hide the form
        document.getElementById('votingForm').style.display = 'none';
        
        // Refresh page after 2 seconds
        setTimeout(function() {
            location.reload();
        }, 2000);
    } else {
        alert('Gagal mengirim suara. Silakan coba lagi.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Suara Anda';
    }
});

// Make candidate cards clickable
document.querySelectorAll('.candidate-card').forEach(card => {
    card.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
    });
});

// Display vote count on console (for admin purposes)
window.addEventListener('load', async function() {
    try {
        const response = await fetch(`${API_BASE}/api/results`);
        const data = await response.json();
        if (data.success) {
            console.log(`Total votes cast: ${data.totalVotes}`);
            console.log('Admin panel available at: /admin');
        }
    } catch (error) {
        // Fallback to localStorage if server unavailable
        const votes = JSON.parse(localStorage.getItem('votes')) || [];
        console.log(`Total local votes: ${votes.length}`);
        console.log('Server not available - running in offline mode');
    }
});
