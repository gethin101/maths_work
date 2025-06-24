// Create a fullscreen video player with no controls
window.onload = function() {
    // Create video element
    const video = document.createElement('video');
    video.src = 'Assets/Mango.mp4'; // Path to your video
    video.autoplay = true;
    video.controls = false;
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'cover';
    video.style.zIndex = '9999';
    video.style.backgroundColor = 'black';
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', ''); // Remove if you want sound
    video.muted = true; // Remove if you want sound

    // Prevent right-click context menu
    video.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Prevent pausing
    video.addEventListener('pause', function() {
        video.play();
    });

    // Prevent keyboard controls
    window.addEventListener('keydown', function(e) {
        e.preventDefault();
    }, true);

    // Request fullscreen
    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
    }

    document.body.appendChild(video);
    video.play();
    setTimeout(() => launchFullscreen(video), 100); // Give time for DOM
};
