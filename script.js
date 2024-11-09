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
        /*{ lat: -27.13426529, lng: -48.59788597 },
        { lat: -27.13440765, lng: -48.59779035 },
        { lat: -27.13431719, lng: -48.59765558 },
        { lat: -27.13415692, lng: -48.59757908 },
        { lat: -27.1331607, lng: -48.5964232 },
        { lat: -27.1341332, lng: -48.5956231 },
        { lat: -27.1363430, lng: -48.5939888 },
        { lat: -27.1406266, lng: -48.5895595 },
        { lat: -27.1445982, lng: -48.5860627 },
        { lat: -27.134320, lng: -48.598074},
       { lat: -27.134460, lng: -48.598276}  */
            { lat: -27.126401886405585, lng: -48.60952780570234 },
            { lat: -27.113728347851314, lng: -48.61015174277602 },
            { lat: -27.102834053772536, lng: -48.61721444293363 },
            { lat: -27.086742883547746, lng: -48.60948493752662 },
            { lat: -27.083489631564486, lng: -48.60396841065913 },
            { lat: -27.07102391793113, lng: -48.59563693794838 },
            { lat: -27.064670931359196, lng: -48.59584987382026 },
            { lat: -27.057858026840815, lng: -48.59763932846573 },
            { lat: -27.051648576144377, lng: -48.59777674356333 },
            { lat: -27.035050635044808, lng: -48.60438538018344 },
            { lat: -27.031941415111508, lng: -48.60433647138123 },
            { lat: -27.033055471223328, lng: -48.604440785106384},
            { lat: -27.031313551475012, lng: -48.60624954938472 },
            { lat: -27.029384708988673, lng: -48.60603989506019 },
            { lat: -27.02873689392269, lng: -48.61110430478241 },
            { lat: -27.027261581970727, lng: -48.612161464602444 },
            { lat: -27.028231549885174, lng: -48.61634374225128 },
            { lat: -27.03072235810896, lng: -48.620829794192325 },
            { lat: -27.034657925133043, lng: -48.62350486199594 },
            { lat: -27.037956857304717, lng: -48.626565549354225 },
            { lat: -27.036737825051844, lng: -48.63298756440155 },
            { lat: -27.038751282475072, lng: -48.635769480020045 },
            { lat: -27.040783074391076, lng: -48.634798891949174 },
            { lat: -27.04300651653759, lng: -48.63377421881811 },
            { lat: -27.043189375780514,lng: -48.634545150756914 },
            { lat: -27.04454022539961, lng: -48.63453224551279 },
            { lat: -27.045181421932625, lng: -48.63474873253143 }
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
