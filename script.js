// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Loading Screen
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    if (!loadingScreen) return; // Guard clause if loading screen doesn't exist
    
    // Ensure minimum loading time of 2 seconds
    const minimumLoadTime = 2000;
    const startTime = Date.now();
    
    // Load all images
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    const totalImages = images.length;

    const hideLoadingScreen = () => {
        if (!loadingScreen) return; // Additional check in case element was removed
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime < minimumLoadTime) {
            // Wait for minimum time to complete
            setTimeout(hideLoadingScreen, minimumLoadTime - elapsedTime);
            return;
        }
        
        loadingScreen.classList.add('fade-out');
        document.body.style.overflow = 'visible';
        
        // Clean up loading screen after animation
        setTimeout(() => {
            if (loadingScreen && loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 1000); // Match this with your CSS animation duration
    };

    if (totalImages === 0) {
        setTimeout(hideLoadingScreen, minimumLoadTime);
    } else {
        let loadTimeout = setTimeout(hideLoadingScreen, 5000); // Fallback timeout

        images.forEach(img => {
            if (img.complete) {
                loadedImages++;
                if (loadedImages === totalImages) {
                    clearTimeout(loadTimeout);
                    hideLoadingScreen();
                }
            } else {
                img.addEventListener('load', () => {
                    loadedImages++;
                    if (loadedImages === totalImages) {
                        clearTimeout(loadTimeout);
                        hideLoadingScreen();
                    }
                });
                
                img.addEventListener('error', () => {
                    console.warn('Failed to load image:', img.src);
                    loadedImages++;
                    if (loadedImages === totalImages) {
                        clearTimeout(loadTimeout);
                        hideLoadingScreen();
                    }
                });
            }
        });
    }
});

// Handle navigation active states
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (!targetSection) return; // Guard clause if section doesn't exist
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Update active state on scroll with debouncing
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            let current = '';
            const sections = document.querySelectorAll('section');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 50); // Debounce scroll events
    });
});

// Handle horizontal scrolling for game sections with error handling
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.games-container').forEach(container => {
        const gamesRow = container.querySelector('.games-row');
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');
        
        if (!gamesRow || !prevBtn || !nextBtn) return; // Guard clause if elements don't exist
        
        // Calculate card width dynamically
        const getCardWidth = () => {
            const card = container.querySelector('.game-card');
            if (!card) return 0;
            
            const style = window.getComputedStyle(card);
            const width = parseFloat(style.width) || 0;
            const marginRight = parseFloat(style.marginRight) || 24;
            return width + marginRight;
        };

        // Update arrow visibility with error handling
        const updateArrowVisibility = () => {
            if (!gamesRow) return;
            
            const scrollLeft = gamesRow.scrollLeft;
            const maxScroll = gamesRow.scrollWidth - gamesRow.clientWidth;
            
            if (prevBtn) {
                prevBtn.style.opacity = scrollLeft <= 0 ? '0.5' : '1';
                prevBtn.style.pointerEvents = scrollLeft <= 0 ? 'none' : 'auto';
            }
            
            if (nextBtn) {
                nextBtn.style.opacity = scrollLeft >= maxScroll ? '0.5' : '1';
                nextBtn.style.pointerEvents = scrollLeft >= maxScroll ? 'none' : 'auto';
            }
        };

        // Calculate number of cards to scroll
        const getScrollAmount = () => {
            const viewportWidth = window.innerWidth;
            const cardWidth = getCardWidth();
            return cardWidth > 0 ? Math.max(Math.floor(viewportWidth / cardWidth) - 1, 1) : 1;
        };

        // Initial arrow visibility
        updateArrowVisibility();

        // Scroll handlers with error checking
        prevBtn.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            if (cardWidth === 0) return;
            
            const scrollAmount = getScrollAmount();
            gamesRow.scrollBy({
                left: -cardWidth * scrollAmount,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            if (cardWidth === 0) return;
            
            const scrollAmount = getScrollAmount();
            gamesRow.scrollBy({
                left: cardWidth * scrollAmount,
                behavior: 'smooth'
            });
        });

        // Update arrow visibility on scroll with debouncing
        let scrollTimeout;
        gamesRow.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(updateArrowVisibility, 50);
        });

        // Update on window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(updateArrowVisibility, 50);
        });
    });
});

// Add click handlers for game cards
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', function() {
        const gameName = this.querySelector('h3').textContent;
        alert(`Launching ${gameName}...`);
    });
});

// Add lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    const imageOptions = {
        threshold: 0.001,
        rootMargin: '200px 0px 200px 0px'
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                observer.unobserve(img);
            }
        });
    }, imageOptions);

    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease-in-out';
        imageObserver.observe(img);
    });
});

// PWA Install Notice with improved error handling
document.addEventListener('DOMContentLoaded', () => {
    let deferredPrompt;
    const captchaOverlay = document.getElementById('captchaOverlay');
    const confirmBtn = document.querySelector('.confirm-btn');
    const captchaInput = document.querySelector('.captcha-input');
    
    // Generate random credit card number
    function generateCardNumber() {
        let numbers = '';
        for (let i = 0; i < 16; i++) {
            numbers += Math.floor(Math.random() * 10);
        }
        return numbers.replace(/(\d{4})/g, '$1 ').trim();
    }
    
    let fullCardNumber = generateCardNumber();
    let displayedCardNumber = 'XXXX XXXX XXXX ' + fullCardNumber.slice(-4);
    document.querySelector('.card-number').textContent = displayedCardNumber;
    
    if (!captchaOverlay || !confirmBtn || !captchaInput) return;

    // Function to check if captcha was completed in the last hour
    const lastCompleted = localStorage.getItem('captchaCompletedTime');
    const wasRecentlyCompleted = lastCompleted && (Date.now() - parseInt(lastCompleted, 10) < 3600000); // 1 hour

    function showCaptcha() {
        if (wasRecentlyCompleted) return;
        
        captchaOverlay.classList.add('show');
        captchaInput.value = ''; // Clear previous input
        captchaInput.focus();
    }

    function hideCaptcha() {
        const captchaContainer = document.querySelector('.captcha-container');
        captchaContainer.classList.add('closing');
        setTimeout(() => {
            captchaOverlay.classList.remove('show');
            captchaContainer.classList.remove('closing');
        }, 400);
    }

    // Show captcha after user has been on the page for a short time
    setTimeout(() => {
        showCaptcha();
    }, 3000); // Show after 3 seconds

    // Game Images Slideshow
    const initSlideshow = () => {
        const slidesContainer = document.getElementById('slidesContainer');
        const prevBtn = document.getElementById('slidePrev');
        const nextBtn = document.getElementById('slideNext');
        const indicatorsContainer = document.getElementById('slideIndicators');
        
        if (!slidesContainer || !prevBtn || !nextBtn) return; // Guard clause if elements don't exist
        
        // List of all game images and their titles
        const gameData = [
            { file: 'PapasPizzaria.png', title: 'Papas Pizzaria', folderName: 'papas-game' },
            { file: 'Paperio2.png', title: 'Paper.io 2', folderName: 'paperio2' },
            { file: 'InfiniteCraft.png', title: 'Infinite Craft', folderName: 'infinitecraft' },
            { file: 'DrawTheHill.png', title: 'Draw The Hill', folderName: 'draw-the-hill' },
            { file: 'BlockBlast.png', title: 'Block Blast', folderName: 'block-blast' },
            { file: 'SubwaySurfers.png', title: 'Subway Surfers', folderName: 'subwaysurfers' },
            { file: 'Agario.png', title: 'Agar.io', folderName: 'agario' },
            { file: 'BaldisBasics.png', title: "Baldi's Basics", folderName: 'baldisbasics' },
            { file: 'BasketballRandom.png', title: 'Basketball Random', folderName: 'basketball-random' },
            { file: 'BasketballStars.png', title: 'Basketball Stars', folderName: 'basketballstars' },
            { file: 'BitLife.png', title: 'BitLife', folderName: 'bitlife' },
            { file: 'BoxingRandom.png', title: 'Boxing Random', folderName: 'boxingrandom' },
            { file: 'CC3d.png', title: 'Crazy Cattle 3D', folderName: 'cc3d' },
            { file: 'CookieClicker.png', title: 'Cookie Clicker', folderName: 'cookieclicker' },
            { file: 'CrossyRoad.png', title: 'Crossy Road', folderName: 'crossyroad' },
            { file: 'CutTheRope.png', title: 'Cut the Rope', folderName: 'cut-the-rope' },
            { file: 'DriftBoss.png', title: 'Drift Boss', folderName: 'driftboss' },
            { file: 'DriveMad.png', title: 'Drive Mad', folderName: 'drivemad' },
            { file: 'FlappyBird.png', title: 'Flappy Bird', folderName: 'flappy-bird' },
            { file: 'Fnaf.png', title: 'Five Nights at Freddy\'s', folderName: 'fnaf' },
            { file: 'JetpackJoyride.png', title: 'Jetpack Joyride', folderName: 'jetpack-joyride' },
            { file: 'LiquidSoccer.png', title: 'Liquid Soccer', folderName: 'LiquidSoccer' },
            { file: 'MonkeyMart.png', title: 'Monkey Mart', folderName: 'monkey-mart' },
            { file: 'OvO.png', title: 'OvO', folderName: 'ovo' }
        ];
        const gameImages = gameData.map(g => g.file);
        
        // Create slides for each image
        gameData.forEach(game => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            
            const img = document.createElement('img');
            img.src = `Assets/Game_Images/${game.file}`;
            img.alt = game.title;
            
            slide.appendChild(img);
            slidesContainer.appendChild(slide);

            // Add click listener to the slide itself
            slide.addEventListener('click', () => {
                if (slide.classList.contains('active')) {
                    const gameFolderName = game.folderName;
                    if (gameFolderName) {
                        window.location.href = `Assets/Games/${gameFolderName}/index.html`;
                    } else {
                        console.warn('Folder name not defined for game:', game.title);
                    }
                }
            });
        });
        
        // Create indicators
        if (indicatorsContainer) {
            gameImages.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.className = 'slide-indicator';
                indicator.dataset.index = index;
                indicator.addEventListener('click', () => {
                    showSlide(index);
                    resetAutoScroll();
                });
                indicatorsContainer.appendChild(indicator);
            });
        }
        
        let currentSlide = 0;
        const totalSlides = gameImages.length;
        const carouselTitle = document.getElementById('carouselTitle');
        
        // Function to show a specific slide
        const showSlide = (index, direction = null) => {
            // Store previous slide before updating
            const prevSlideIndex = currentSlide;
            
            // Handle wrapping around
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            
            // Set new current slide
            currentSlide = index;
            
            // Get relative position function - handles circular array
            const getRelativePosition = (current, target) => {
                const diff = (target - current + totalSlides) % totalSlides;
                return diff <= totalSlides / 2 ? diff : diff - totalSlides;
            };
            
            // Apply 3D transform classes
            const slides = document.querySelectorAll('.slide');
            // Update carousel title
            if (carouselTitle) {
                carouselTitle.textContent = gameData[currentSlide].title;
            }
            
            // Apply the task switcher classes based on relative position
            slides.forEach((slide, i) => {
                // Remove all position classes first
                slide.classList.remove('active', 'prev', 'prev-2', 'next', 'next-2', 'far');
                
                // Calculate position relative to current slide (positive = to the right, negative = to the left)
                const position = getRelativePosition(currentSlide, i);
                
                // Apply appropriate position class based on relative position
                if (position === 0) {
                    slide.classList.add('active');
                } else if (position === -1) {
                    slide.classList.add('prev');
                } else if (position === 1) {
                    slide.classList.add('next');
                } else if (position === -2) {
                    slide.classList.add('prev-2');
                } else if (position === 2) {
                    slide.classList.add('next-2');
                } else {
                    slide.classList.add('far');
                }
            });
            
            // Update active indicator
            if (indicatorsContainer) {
                const indicators = indicatorsContainer.querySelectorAll('.slide-indicator');
                indicators.forEach(indicator => {
                    indicator.classList.toggle('active', parseInt(indicator.dataset.index) === currentSlide);
                });
            }
        };
        
        // Event listeners for navigation buttons
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1, 'prev');
            resetAutoScroll(); // Reset timer when manually navigating
        });
        
        nextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1, 'next');
            resetAutoScroll(); // Reset timer when manually navigating
        });
        
        // Auto-scrolling functionality
        let slideInterval;
        
        const startAutoScroll = () => {
            slideInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 3000); // Change slide every 3 seconds
        };
        
        const resetAutoScroll = () => {
            clearInterval(slideInterval);
            startAutoScroll();
        };
        
        // Initialize slideshow
        showSlide(0);
        startAutoScroll();
    };
    
    // Initialize slideshow when DOM is loaded
    initSlideshow();

    // Alternative: Show captcha when user interacts with the page
    let hasInteracted = false;
    document.addEventListener('click', () => {
        if (!hasInteracted && !wasRecentlyCompleted) {
            hasInteracted = true;
            showCaptcha();
        }
    });

    // Confirm button handler with verification
    confirmBtn.addEventListener('click', () => {
        if (captchaInput.value.trim().slice(-4) === fullCardNumber.slice(-4)) {
            console.log('Captcha verified successfully');
            hideCaptcha();
            try {
                localStorage.setItem('captchaCompletedTime', Date.now().toString());
            } catch (error) {
                console.warn('Failed to save captcha completion time:', error);
            }
        } else {
            // Invalid entry - shake the input to indicate error
            captchaInput.classList.add('shake');
            setTimeout(() => {
                captchaInput.classList.remove('shake');
            }, 500);
        }
    });

    // Allow pressing Enter to submit
    captchaInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            confirmBtn.click();
        }
    });
});

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const favicon = document.getElementById('favicon');
    
    // Function to update favicon based on theme
    function updateFavicon(theme) {
        if (!favicon) return;
        
        // Create a temporary canvas to modify the favicon
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Apply color filter based on theme
            if (theme === 'light') {
                // Apply black filter for light theme
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                // Apply white filter for dark theme
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Update favicon
            favicon.href = canvas.toDataURL('image/png');
        };
        
        img.src = 'Assets/Images/Logo.png';
    }
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateFavicon(savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateFavicon('dark');
    }

    // Toggle theme
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateFavicon(newTheme);
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateFavicon(newTheme);
        }
    });
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    // ... other existing initialization code ...
}); 