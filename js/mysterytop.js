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
    const confirmPositionButton = document.getElementById('confirm-position');

    let players = [];
    let currentPlayerIndex = 0;
    let currentRound = 0;
    let characters = [];
    let currentCharacter = null;

    if (selectedCategory && selectedCategory.name && selectedCategory.characters) {
        selectedCategoryText.textContent = `Categoría seleccionada: ${selectedCategory.name}`;
        characters = [...selectedCategory.characters];
    } else {
        alert('No se ha seleccionado ninguna categoría.');
        return;
    }

    const initializeGame = (playerCount, rounds) => {
        players = Array.from({ length: playerCount }, (_, i) => ({
            name: `Jugador ${i + 1}`,
            top: Array(rounds).fill(null) // Cada jugador tiene su propio top vacío
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
        currentPlayerIndex = 0;
        updatePlayerTurn();
    };

    const updatePlayerTurn = () => {
        playerTurnDiv.textContent = `Turno de: ${players[currentPlayerIndex].name}`;
        confirmPositionButton.style.display = 'inline-block';
    };

    const renderPlayersTops = () => {
        playersTopsContainer.innerHTML = players
            .map(
                (player) => `
                <div class="player-top">
                    <h3>${player.name}</h3>
                    <ul>
                        ${player.top
                            .map(
                                (entry, index) => `
                            <li>
                                <strong>${index + 1}:</strong>
                                ${entry 
                                    ? `<img src="${entry.img}" >`
                                    : '<span>Vacío</span>'}
                            </li>
                        `
                            )
                            .join('')}
                    </ul>
                </div>
            `
            )
            .join('');
    };
    

    const confirmPosition = () => {
        const player = players[currentPlayerIndex];
        const availablePositions = player.top
            .map((entry, index) => (entry === null ? index : null))
            .filter((index) => index !== null);

        if (availablePositions.length === 0) {
            alert("Tu top ya está completo.");
            return;
        }

        const position = prompt(
            `Personaje actual: ${currentCharacter.name}\nPosiciones disponibles: ${availablePositions
                .map((pos) => `${pos + 1}`)
                .join(', ')}\nElige el índice de posición (1-${player.top.length}):`
        );

        if (position !== null && availablePositions.includes(Number(position) - 1)) {
            player.top[Number(position) - 1] = currentCharacter;
            nextPlayer();
        } else {
            alert("Posición inválida.");
        }
    };

    const nextPlayer = () => {
        currentPlayerIndex++;
        if (currentPlayerIndex >= players.length) {
            currentRound++;
            if (currentRound >= players[0].top.length) {
                endGame();
            } else {
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
        confirmPositionButton.style.display = 'none';
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

    confirmPositionButton.addEventListener('click', confirmPosition);
});
