(function createSnowflakes() {
    // Verschiedene Schneeflocken-Varianten
    const snowflakes = ['❄', '❅', '❆', '⛄', '❆'];
    
    // Adaptive Einstellungen basierend auf Gerät
    const isMobile = window.innerWidth < 768;
    const isLowPerformance = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let snowflakeCount = 25; // Standard
    let creationInterval = 600; // Standard
    let checkInterval = 800; // Standard
    
    if (isMobile) {
        snowflakeCount = isLowPerformance ? 8 : 12;
        creationInterval = 800;
        checkInterval = 1000;
    } else if (window.innerWidth > 1920) {
        snowflakeCount = 40;
        creationInterval = 400;
    }
    
    // Tracking für Performance
    let activeSnowflakes = 0;
    const maxSnowflakes = snowflakeCount;
    
    function createSnowflake() {
        if (activeSnowflakes >= maxSnowflakes) return;
        
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Zufällige Schneeflocken-Variante
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        // Zufällige Größen-Klasse
        const sizeRandom = Math.random();
        if (sizeRandom < 0.5) {
            snowflake.classList.add('light');
        } else if (sizeRandom < 0.85) {
            snowflake.classList.add('medium');
        } else {
            snowflake.classList.add('heavy');
        }
        
        // Zufällige horizontale Startposition
        const left = Math.random() * (window.innerWidth + 100) - 50;
        snowflake.style.left = left + 'px';
        
        // Zufällige Animation Dauer (8-16 Sekunden) - langsamer = natürlicher
        const duration = Math.random() * 8 + 8;
        snowflake.style.animationDuration = duration + 's';
        
        // Kleine Verzögerung für gestaffelte Animation
        const delay = Math.random() * 1;
        snowflake.style.animationDelay = delay + 's';
        
        // Zufällige Sway-Animation
        const swayType = Math.random() > 0.5 ? 'sway-left' : 'sway-right';
        const swayDuration = Math.random() * 4 + 6;
        
        snowflake.style.animation = `
            snowfall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards,
            ${swayType} ${swayDuration}s ease-in-out ${delay}s infinite
        `;
        
        activeSnowflakes++;
        document.body.appendChild(snowflake);
        
        // Cleanup nach Animation
        const totalTime = (duration + delay + 1) * 1000;
        const timeoutId = setTimeout(() => {
            if (snowflake.parentElement) {
                snowflake.remove();
            }
            activeSnowflakes = Math.max(0, activeSnowflakes - 1);
        }, totalTime);
        
        // Speichere Timeout für späteren Cleanup wenn nötig
        snowflake.dataset.timeoutId = timeoutId;
    }
    
    // Initiale Schneeflocken erstellen (gestaffelt)
    const initialDelay = isMobile ? 300 : 150;
    for (let i = 0; i < Math.ceil(snowflakeCount / 2); i++) {
        setTimeout(() => createSnowflake(), i * initialDelay);
    }
    
    // Kontinuierlich neue Schneeflocken erzeugen
    const creationTimerId = setInterval(() => {
        if (activeSnowflakes < maxSnowflakes * 0.9) {
            createSnowflake();
        }
    }, creationInterval);
    
    // Cleanup-Funktion wenn Tab inaktiv wird
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(creationTimerId);
            document.querySelectorAll('.snowflake').forEach(sf => {
                if (sf.dataset.timeoutId) clearTimeout(sf.dataset.timeoutId);
                sf.remove();
            });
            activeSnowflakes = 0;
        }
    });
    
    console.log(`🎄 Frohe Weihnachten! ❄️ Schneeflocken-Effekt aktiviert! (${snowflakeCount} Flocken, ${isMobile ? 'Mobile' : 'Desktop'})`);
})();
