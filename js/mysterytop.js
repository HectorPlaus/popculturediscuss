document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const selectedCategoryText = document.getElementById('selected-category');
    const startGameButton = document.getElementById('start-game');
    const playerCountInput = document.getElementById('participants');
    const roundsCountInput = document.getElementById('rounds');
    const setupSection = document.getElementById('mysterytop-setup');
    const gameSection = document.getElementById('mysterytop-game');
    const characterImage = document.getElementById('character-image');
    const characterName = document.getElementById('character-name');
    const playerTurnDiv = document.getElementById('player-turn');
    const playersTopsContainer = document.getElementById('players-tops');

    let players = [];
    let currentPlayerIndex = 0;
    let currentRound = 0;
    let characters = [];
    let currentCharacter = null;

    if (selectedCategory && selectedCategory.name && selectedCategory.characters) {
        selectedCategoryText.textContent = selectedCategory.name;
        characters = [...selectedCategory.characters];
    } else {
        alert('No se ha seleccionado ninguna categoría.');
        return;
    }

    const initializeGame = (playerCount, rounds) => {
        players = Array.from({ length: playerCount }, (_, i) => ({
            name: `Jugador ${i + 1}`,
            top: Array(rounds).fill(null) 
        }));
        renderPlayersTops();
        startRound();
    };

    const startRound = () => {
        if (characters.length === 0) {
            alert("No quedan personajes disponibles.");
            return;
        }
        currentCharacter = characters.splice(Math.floor(Math.random() * characters.length), 1)[0];
        characterImage.src = currentCharacter.img || 'placeholder.png';
        characterImage.style.display = 'block';
        characterName.textContent = currentCharacter.name;
        updatePlayerTurn();
    };

    const updatePlayerTurn = () => {
        playerTurnDiv.textContent = `Turno de: ${players[currentPlayerIndex].name}`;
    };

    const renderPlayersTops = () => {
        playersTopsContainer.innerHTML = players
            .map((player, playerIndex) => `
                <div class="player-top" data-player-index="${playerIndex}">
                    <h3>${player.name}</h3>
                    <ul>
                        ${player.top
                            .map((entry, index) => `
                            <li class="top-position" data-index="${index}" data-player-index="${playerIndex}">
                                <strong>${index + 1}:</strong>
                                ${entry 
                                    ? `<img src="${entry.img}" >`
                                    : '<span>Vacío</span>'}
                            </li>
                        `)
                            .join('')}
                    </ul>
                </div>
            `)
            .join('');

        document.querySelectorAll('.top-position').forEach((position) => {
            position.addEventListener('click', (event) => {
                const playerIndex = parseInt(event.currentTarget.dataset.playerIndex, 10);
                const positionIndex = parseInt(event.currentTarget.dataset.index, 10);
                if (playerIndex !== currentPlayerIndex) {
                    alert("No es tu turno.");
                    return;
                }
                placeCharacter(playerIndex, positionIndex);
            });
        });
    };

    const placeCharacter = (playerIndex, positionIndex) => {
        const player = players[playerIndex];
        if (player.top[positionIndex] !== null) {
            alert("Esta posición ya está ocupada.");
            return;
        }
        if (player.top.includes(currentCharacter)) {
            alert("No puedes colocar el mismo personaje en más de un lugar.");
            return;
        }
        player.top[positionIndex] = currentCharacter;
        nextPlayer();
    };

    const nextPlayer = () => {
        currentPlayerIndex++;
        if (currentPlayerIndex >= players.length) {
            currentRound++;
            if (currentRound >= players[0].top.length) {
                endGame();
            } else {
                currentPlayerIndex = 0;
                startRound();
            }
        } else {
            updatePlayerTurn();
        }
        renderPlayersTops();
    };

    const endGame = () => {
        alert("¡El juego ha terminado! Aquí están los tops finales:");
        renderPlayersTops();
    };

    startGameButton.addEventListener('click', () => {
        const playerCount = parseInt(playerCountInput.value, 10);
        const roundsCount = parseInt(roundsCountInput.value, 10);

        if (
            isNaN(playerCount) ||
            isNaN(roundsCount) ||
            playerCount < 1 ||
            playerCount > 10 ||
            roundsCount < 1 ||
            roundsCount > 10
        ) {
            alert("Por favor, introduce números válidos para jugadores (1-10) y rondas (1-10).");
            return;
        }

        setupSection.style.display = 'none';
        gameSection.style.display = 'flex';
        initializeGame(playerCount, roundsCount);
    });
});
