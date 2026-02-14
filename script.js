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

// Function to store vote
function storeVote(voteData) {
    // Get existing votes from localStorage
    let votes = JSON.parse(localStorage.getItem('votes')) || [];
    
    // Add new vote
    votes.push(voteData);
    
    // Store back to localStorage
    localStorage.setItem('votes', JSON.stringify(votes));
    
    // Log the vote (for demonstration purposes)
    console.log('Vote stored:', voteData);
    console.log('All votes:', votes);
    
    return voteData;
}

// Handle form submission
document.getElementById('votingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get selected values
    const leadSelection = document.querySelector('input[name="lead"]:checked');
    const coleadSelection = document.querySelector('input[name="colead"]:checked');
    
    if (!leadSelection || !coleadSelection) {
        alert('Please select one candidate for each position');
        return;
    }
    
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
    storeVote(voteData);
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('hidden');
    
    // Hide the form
    document.getElementById('votingForm').style.display = 'none';
    
    // Refresh page after 2 seconds
    setTimeout(function() {
        location.reload();
    }, 2000);
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
window.addEventListener('load', function() {
    const votes = JSON.parse(localStorage.getItem('votes')) || [];
    console.log(`Total votes cast: ${votes.length}`);
    
    if (votes.length > 0) {
        console.log('Recent votes:', votes.slice(-5));
    }
});
