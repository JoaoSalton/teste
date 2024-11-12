// Cria o botão
const startButton = document.createElement("button");
startButton.textContent = "Iniciar Jogo";
startButton.style.position = "absolute";
startButton.style.top = "50%";
startButton.style.left = "50%";
startButton.style.transform = "translate(-50%, -50%)";
startButton.style.padding = "10px 20px";
startButton.style.fontSize = "16px";
startButton.style.cursor = "pointer";
startButton.style.zIndex = 1000; // Garante que o botão apareça acima de outros elementos

// Adiciona o botão ao corpo da página
document.body.appendChild(startButton);

// Função para iniciar os áudios e remover o botão
function iniciarJogo() {
    somPassos.play(); // Toca o som para desbloquear o áudio
    document.body.removeChild(startButton); // Remove o botão após o clique

    // Agora, chama a função para começar o jogo
    getUserGPS();
}

// Adiciona um evento de clique ao botão
startButton.addEventListener("click", iniciarJogo);
// Variável para controlar se o zoom inicial foi aplicado
let zoomInicialAplicado = false;
// Inicializa o mapa sem centralizá-lo inicialmente
const map = L.map('map');

// Adiciona o tile layer do OpenStreetMap com zoom mínimo e máximo
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 10,
    maxZoom: 20
}).addTo(map);

// Define os ícones de cavalo para cada direção
const userIcons = {
    up: L.icon({ iconUrl: 'up.png', iconSize: [35, 60], iconAnchor: [16, 30] }),
    down: L.icon({ iconUrl: 'down.png', iconSize: [35, 60], iconAnchor: [16 , 30] }),
    left: L.icon({ iconUrl: 'left.png', iconSize: [60, 35], iconAnchor: [30 , 16] }),
    right: L.icon({ iconUrl: 'right.png', iconSize: [60, 35], iconAnchor: [30 ,16] })
};

// Variável para armazenar o marcador do usuário
let userMarker;

// Array para armazenar os waypoints
let waypoints = [];

// Som de passos
const somPassos = new Audio('regga.mp3');
let tocandoPassos = false;

// Som de waypoint
const somWaypoint = new Audio('smoke.mp3');

// Som de parabéns
const somParabens = new Audio('trip.mp3'); // Substitua pelo caminho correto do som de parabéns

// Função para tocar o som de passos
function tocarSomPassos() {
    if (!tocandoPassos) {
        tocandoPassos = true;
        somPassos.play();
        somPassos.onended = function() { tocandoPassos = false; };
    }
}

// Função para parar o som de passos
function pararSomPassos() {
    if (!somPassos.paused) {
        somPassos.pause();
        somPassos.currentTime = 0;
        tocandoPassos = false;
    }
}

// Função para tocar o som do waypoint
function tocarSomWaypoint() {
    pararSomPassos();
    somWaypoint.play();
    somWaypoint.onended = function() { tocarSomPassos(); };
}

// Função para tocar o som de parabéns
function tocarSomParabens() {
    somParabens.play();
}

// Função para atualizar a posição do usuário e mudar o ícone
function updateUserPosition(lat, lng, direction) {
    if (userMarker) {
        // Atualiza a posição e o ícone do marcador existente
        userMarker.setLatLng([lat, lng]);  
        userMarker.setIcon(userIcons[direction]);
    } else {
        // Cria o marcador se ele não existir
        userMarker = L.marker([lat, lng], { icon: userIcons[direction] }).addTo(map);
        userMarker.bindPopup(`Buds Restantes: ${waypoints.length}`).openPopup();
    }

    // Aplica o zoom apenas na primeira vez
    if (!zoomInicialAplicado) {
        map.setView([lat, lng], 18);
        zoomInicialAplicado = true;
    }

    // Função para coletar waypoints
    collectWaypoints(lat, lng);
}

// Função para adicionar waypoints fixos ao mapa
function addFixedWaypoints() {
    const fixedWaypoints = [
        
                    { lat: -27.761879155879104, lng: -48.573467780752665 },
                    { lat: -27.76215294507768,  lng: -48.573228872375054 },
                    { lat: -27.76236390087875,  lng: -48.57305225259533 },
                    { lat: -27.76259056533229,  lng: -48.572857792438924 },
                    { lat: -27.763073026992735, lng: -48.57244491604457 },
                    { lat: -27.764063203711434, lng: -48.571621788089125 },
                    { lat: -27.76475950831704, lng: -48.571053925822966 }
                    
                ];

    const waypointIcon = L.icon({ iconUrl: 'wee.png', iconSize: [50, 50], iconAnchor: [25, 25] });

    fixedWaypoints.forEach(waypoint => {
        const marker = L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon }).addTo(map);
        waypoint.marker = marker;
        waypoints.push(waypoint);
    });

    updateRemainingWaypoints(); // Atualiza o contador de waypoints restantes
}

// Chame `addFixedWaypoints` para adicionar waypoints fixos
addFixedWaypoints();

// Função para coletar waypoints próximos e narrar
function collectWaypoints(userLat, userLng) {
    let waypointCaptured = false;

    waypoints = waypoints.filter(waypoint => {
        const waypointPosition = L.latLng(waypoint.lat, waypoint.lng);
        const userPosition = L.latLng(userLat, userLng);

        const distance = userPosition.distanceTo(waypointPosition); // Distância em metros

        if (distance < 16) {  // Proximidade para capturar waypoint
            waypoint.marker.remove();
            tocarSomWaypoint();
            waypointCaptured = true;
            return false; // Remove o waypoint da lista
        }
        return true; // Mantém o waypoint na lista
    });

    // Atualiza o contador se algum waypoint foi capturado
    if (waypointCaptured) {
        updateRemainingWaypoints();
    }
}

// Função para verificar e narrar a quantidade de waypoints restantes
function updateRemainingWaypoints() {
    // Atualiza o conteúdo do popup do marcador do usuário
    if (userMarker) {
        userMarker.setPopupContent(`Buds restantes: ${waypoints.length}`);
    }

    if (waypoints.length > 1) {
        narrar("Cheech Queimou o Bud. Restam " + waypoints.length + " Buds.");
    } else if (waypoints.length === 1) {
        narrar("Cheech Queimou o Penúltimo Bud. Resta Apenas Uma Baga.");
    } else {
        narrar("Queimando Tudo Com CHeech! Cheech está viajando!");
        tocarSomParabens(); // Toca som de parabéns ao coletar todos os waypoints
    }
}

// Função para sintetizar fala
function narrar(mensagem) {
    const sintese = new SpeechSynthesisUtterance(mensagem);
    sintese.lang = 'pt-BR'; // Define a língua para português brasileiro
    window.speechSynthesis.speak(sintese);
}

// Função para obter a posição GPS do usuário
function getUserGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Atualiza a posição do usuário com base na direção do movimento
            const direction = calculateDirection(lat, lng);
            updateUserPosition(lat, lng, direction);  
            collectWaypoints(lat, lng);  
        }, function(error) {
            console.log("Erro ao obter a localização: ", error.message);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });
    } else {
        alert("Geolocalização não é suportada neste navegador.");
    }
}

// Função para calcular a direção do movimento com base na posição anterior
let lastPosition = null;
function calculateDirection(lat, lng) {
    if (lastPosition) {
        const deltaLat = lat - lastPosition.lat;
        const deltaLng = lng - lastPosition.lng;

        if (Math.abs(deltaLat) > Math.abs(deltaLng)) {
            return deltaLat > 0 ? 'up' : 'down';
        } else {
            return deltaLng > 0 ? 'right' : 'left';
        }
    }
    lastPosition = { lat, lng }; // Inicializa a posição anterior
    return 'right'; 
}

// Chama a função para obter a localização GPS em tempo real
getUserGPS();
