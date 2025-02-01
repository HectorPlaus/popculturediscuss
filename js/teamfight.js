document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const selectedCategoryText = document.getElementById('selected-category');
    const startGameButton = document.getElementById('start-game');
    const playerCountInput = document.getElementById('player-count');
    const gameSection = document.getElementById('teamfight-game');
    const setupSection = document.getElementById('teamfight-setup');
    const teamsContainer = document.getElementById('teamfight-teams');
    const currentTurnDiv = document.getElementById('current-turn');
    const generateCharacterButton = document.getElementById('generate-character');
    const skipCharacterButton = document.getElementById('skip-character');
    const generatedCharacterDiv = document.getElementById('generated-character');

    let positions = ['Capitán', 'Vice Capitán', 'Tanque', 'Sanador', 'Soporte', 'Soporte'];
    if (selectedCategory?.name === "NBA Players") {
        positions = ['Base', 'Escolta', 'Alero', 'Ala Pivot', 'Pivot', 'Sexto Hombre'];
    } else if (selectedCategory?.name === "One Piece - Personajes") {
        positions = ['Capitán', 'Vice Capitán', 'Cocinero', 'Doctor', 'Navegante', 'Tirador'];
    }

    let characters = selectedCategory?.characters || [];
    let players = [];
    let currentPlayerIndex = 0;
    let hasSkipped = {};
    let currentCharacter = null;

    if (!selectedCategory) {
        alert('No se ha seleccionado ninguna categoría.');
        return;
    }
    selectedCategoryText.textContent = `${selectedCategory.name}`;

    const initializeGame = (playerCount) => {
        players = Array.from({ length: playerCount }, (_, i) => ({
            name: `Jugador ${i + 1}`,
            team: positions.map(() => null),
        }));
        hasSkipped = Object.fromEntries(players.map(player => [player.name, false]));
        renderTeams();
        currentPlayerIndex = 0;
        updateCurrentTurn();
    };

    const renderTeams = () => {
        teamsContainer.innerHTML = '';
        players.forEach((player, playerIndex) => {
            const teamDiv = document.createElement('div');
            teamDiv.classList.add('team');
            teamDiv.innerHTML = `<h3>${player.name}</h3>`;

            const teamContainer = document.createElement('div');
            teamContainer.classList.add('tripulation-container');
            player.team.forEach((member, i) => {
                const positionDiv = document.createElement('div');
                positionDiv.classList.add('position');
                positionDiv.innerHTML = `
                    <span>${positions[i]}:</span>
                    ${member ? `<img src="${member.img}" alt="${member.name}"><p>${member.name}</p>` : '<p>Vacío</p>'}
                `;
                
                if (!member && currentPlayerIndex === playerIndex) {
                    positionDiv.addEventListener('click', () => assignCharacter(i));
                }
                teamContainer.appendChild(positionDiv);
            });

            teamDiv.appendChild(teamContainer);
            teamsContainer.appendChild(teamDiv);
        });
    };

    const updateCurrentTurn = () => {
        currentTurnDiv.innerText = `Turno de: ${players[currentPlayerIndex].name}`;
    };

    const generateCharacter = () => {
        if (characters.length === 0) {
            alert("No quedan personajes disponibles.");
            return;
        }
        currentCharacter = characters.splice(Math.floor(Math.random() * characters.length), 1)[0];
        
        generatedCharacterDiv.innerHTML = `
            <img src="${currentCharacter.img}" alt="${currentCharacter.name}">
            <p>${currentCharacter.name}</p>
        `;
        
        generateCharacterButton.disabled = true;
    };

    const assignCharacter = (positionIndex) => {
        if (!currentCharacter) {
            alert("Primero debes generar un personaje.");
            return;
        }
        
        players[currentPlayerIndex].team[positionIndex] = currentCharacter;
        currentCharacter = null;
        generateCharacterButton.disabled = false;
        generatedCharacterDiv.innerHTML = '';
        nextTurn();
    };

    const skipCharacter = () => {
        const currentPlayer = players[currentPlayerIndex].name;
        if (hasSkipped[currentPlayer]) {
            alert("Ya has usado tu único skip.");
            return;
        }
        
        if (!currentCharacter) {
            alert("No hay personaje generado para skipear.");
            return;
        }
        
        hasSkipped[currentPlayer] = true;
        generateCharacter();
    };

    const nextTurn = () => {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateCurrentTurn();
        renderTeams();
    };

    startGameButton.addEventListener('click', () => {
        const playerCount = parseInt(playerCountInput.value, 10);
        if (isNaN(playerCount) || playerCount < 2 || playerCount > 10) {
            alert("Por favor, introduce un número válido de participantes (2-10).");
            return;
        }

        setupSection.style.display = 'none';
        gameSection.style.display = 'flex';
        initializeGame(playerCount);
    });

    generateCharacterButton.addEventListener('click', generateCharacter);
    skipCharacterButton.addEventListener('click', skipCharacter);
});
