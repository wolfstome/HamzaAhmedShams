document.addEventListener('DOMContentLoaded', function() {

    // ======================================================================
    // 1. AUDIO & WELCOME SCREEN
    // ======================================================================
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-btn');
    const bgAudio = document.getElementById('bg-audio'); 

    // Lock scroll initially
    document.body.style.overflow = 'hidden';

    if (enterBtn && welcomeScreen && bgAudio) {
        enterBtn.addEventListener('click', () => {
            // Hide Welcome Screen
            welcomeScreen.classList.add('hide-welcome');
            
            // Play Audio (initiated by user click)
            bgAudio.volume = 0.6; 
            bgAudio.play().catch(error => console.log("Audio playback failed:", error));
            
            // Unlock Scroll
            document.body.style.overflow = 'auto';
        });
    }

    // ======================================================================
    // 2. SCROLL ANIMATIONS
    // ======================================================================
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.slide-up').forEach(el => observer.observe(el));

    // ======================================================================
    // 3. COUNTDOWN TIMER
    // ======================================================================
    const targetDate = new Date("Dec 20, 2025 12:00:00").getTime();
    const countdownGrid = document.getElementById('countdown');

    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;
    let timerInterval;

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff < 0) {
            if (countdownGrid) {
                countdownGrid.innerHTML = '<div class="cd-box" style="width:100%; border-color:white;"><span class="cd-num">Mubarak!</span><span class="cd-label">Celebration Started</span></div>';
            }
            clearInterval(timerInterval); 
            return;
        }

        const days = Math.floor(diff / DAY);
        const hours = Math.floor((diff % DAY) / HOUR);
        const mins = Math.floor((diff % HOUR) / MINUTE);
        const secs = Math.floor((diff % MINUTE) / SECOND);

        if (countdownGrid) {
            countdownGrid.innerHTML = `
                <div class="cd-box"><span class="cd-num">${days}</span><span class="cd-label">Days</span></div>
                <div class="cd-box"><span class="cd-num">${hours}</span><span class="cd-label">Hrs</span></div>
                <div class="cd-box"><span class="cd-num">${mins}</span><span class="cd-label">Min</span></div>
                <div class="cd-box"><span class="cd-num">${secs}</span><span class="cd-label">Sec</span></div>
            `;
        }
    }

    if (countdownGrid) {
        timerInterval = setInterval(updateTimer, SECOND); 
        updateTimer();
    }
    
    // ======================================================================
    // 4. WISHES SYSTEM (API INTEGRATION FOR GLOBAL VISIBILITY)
    // ======================================================================

    // !!! PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE !!!
    const API_URL = 'PASTE_YOUR_COPIED_WEB_APP_URL_HERE'; // <<< REPLACE THIS LINE

    const wishForm = document.getElementById('wish-form');
    const wishesFeed = document.getElementById('wishes-feed');

    // --------------------------------------------------
    // Fetch WISHES from API (GET Request)
    // --------------------------------------------------
    async function fetchWishes() {
        if (!wishesFeed) return;
        wishesFeed.innerHTML = '<p style="text-align:center; color: var(--emerald);">Loading wishes...</p>';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch wishes from API.');
            
            // The API returns the data, we store it and reverse it so newest is on top
            window.savedWishes = (await response.json()).reverse(); 
            renderWishes();

        } catch (error) {
            console.error("Error fetching wishes:", error);
            wishesFeed.innerHTML = '<p style="text-align:center; color:red;">Could not load wishes. Please try again later.</p>';
        }
    }

    // --------------------------------------------------
    // Submit a new WISH to API (POST Request)
    // --------------------------------------------------
    async function submitWish(name, message) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ name: name, msg: message }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to submit wish.');
            
            // After successful submission, re-fetch and re-render all wishes
            await fetchWishes(); 
            
        } catch (error) {
            console.error("Error submitting wish:", error);
            alert("Failed to send your wish. Please check your network.");
        }
    }

    // --------------------------------------------------
    // Render Logic (Uses global data from API)
    // --------------------------------------------------
    function renderWishes() {
        if (!wishesFeed) return;
        wishesFeed.innerHTML = ''; 
        const currentWishes = window.savedWishes || [];

        if (currentWishes.length === 0) {
            wishesFeed.innerHTML = '<p class="no-wishes" style="text-align:center; color:#777; padding-top: 10px;">Be the first to send a wish!</p>';
        }

        currentWishes.forEach((wish) => {
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card slide-up visible'; 

            let htmlContent = `
                <div class="wish-main">
                    <p class="wish-text">"${wish.msg}"</p>
                    <p class="wish-author">- ${wish.name}</p>
                    </div>
            `;
            
            wishCard.innerHTML = htmlContent;
            // AppendChild maintains the order (newest on top after reversing the fetch)
            wishesFeed.appendChild(wishCard); 
        });
    }

    // Event listener for form submission
    if (wishForm) {
        wishForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const nameInput = document.getElementById('user-name');
            const messageInput = document.getElementById('user-msg');
            
            if (!nameInput || !messageInput) return;

            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !message) return;

            // Call the new submit function
            submitWish(name, message);
            
            wishForm.reset();
        });
    }

    // Initial Call to fetch and render wishes when the page loads
    fetchWishes();

    // ======================================================================
    // 5. EVENT FILTERING LOGIC (DYNAMIC VISIBILITY)
    // ======================================================================

    function filterEvents() {
        const urlParams = new URLSearchParams(window.location.search);
        const filterType = urlParams.get('show'); 

        // Get the card elements using their IDs
        const mehndiCard = document.getElementById('mehndi-card');
        const baratCard = document.getElementById('barat-card');
        const walimaCard = document.getElementById('walima-card');
        
        // List all cards
        const allCards = [mehndiCard, baratCard, walimaCard];
        
        // Hide all cards by default before deciding which to show
        allCards.forEach(card => {
            if (card) card.style.display = 'none';
        });


        // Decide which card(s) to show based on the URL parameter
        switch (filterType) {
            case 'walima':
                if (walimaCard) walimaCard.style.display = 'block';
                break;
            case 'barat':
                if (baratCard) baratCard.style.display = 'block';
                break;
            case 'mehndi':
                if (mehndiCard) mehndiCard.style.display = 'block';
                break;
            case 'baratwalima':
                if (baratCard) baratCard.style.display = 'block';
                if (walimaCard) walimaCard.style.display = 'block';
                break;
            case 'mehindbarat':
                if (mehndiCard) mehndiCard.style.display = 'block';
                if (baratCard) baratCard.style.display = 'block';
                break;
            case 'mehndiorwalima': 
                if (mehndiCard) mehndiCard.style.display = 'block';
                if (walimaCard) walimaCard.style.display = 'block';
                break;
            case 'all':
            default:
                // Fallback: If parameter is missing or unknown, show all events
                allCards.forEach(card => {
                    if (card) card.style.display = 'block';
                });
                break;
        }
    }
    
    // Run the filter function when the page loads
    filterEvents();
});
