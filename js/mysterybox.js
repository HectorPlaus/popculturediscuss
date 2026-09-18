document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const setup = document.getElementById('mysterybox-setup');
    const game = document.getElementById('mysterybox-game');
    const categoryText = document.getElementById('selected-category');
    const playersInput = document.getElementById('players-count');
    const spacesInput = document.getElementById('team-spaces');
    const boxesInput = document.getElementById('boxes-count');
    const startButton = document.getElementById('start-mysterybox');
    const setupWarning = document.getElementById('setup-warning');
    const roundInfo = document.getElementById('round-info');
    const phaseInfo = document.getElementById('phase-info');
    const gameMessage = document.getElementById('game-message');
    const playersBoard = document.getElementById('players-board');
    const boxesBoard = document.getElementById('boxes-board');
    const decisionArea = document.getElementById('decision-area');
    const finalSummary = document.getElementById('final-summary');

    let players = [];
    let characters = [];
    let boxes = [];
    let round = 0;
    let currentPlayer = 0;
    let selectionCount = 0;
    let decisionCount = 0;
    let roundStartPlayer = 0;
    let phase = 'selection';
    let spaces = 0;
    let boxesPerRound = 0;
    let availableCharacters = [];

    if (!selectedCategory?.characters?.length) {
        alert('Seleccione una categoría con elementos antes de iniciar.');
        window.location.href = 'mode.html';
        return;
    }
    categoryText.textContent = selectedCategory.name || 'Categoría seleccionada';
    characters = [...selectedCategory.characters];

    function showWarning(message) {
        setupWarning.textContent = message;
        setupWarning.classList.remove('hidden');
    }

    function shuffle(items) {
        return [...items].sort(() => Math.random() - 0.5);
    }

    function createPlayers(count) {
        return Array.from({ length: count }, (_, index) => ({
            name: `Jugador ${index + 1}`,
            team: []
        }));
    }

    function startGame() {
        const playerCount = parseInt(playersInput.value, 10);
        spaces = parseInt(spacesInput.value, 10);
        boxesPerRound = parseInt(boxesInput.value, 10);
        const requiredCharacters = playerCount * spaces;

        if (!playerCount || playerCount < 1 || !spaces || spaces < 1 || !boxesPerRound || boxesPerRound < playerCount) {
            showWarning(`Introduce valores válidos. Debe haber al menos ${playerCount || 1} cajas por jugador.`);
            return;
        }
        if (characters.length < boxesPerRound * spaces) {
            showWarning(`No hay suficientes personajes para ${spaces} rondas de ${boxesPerRound} cajas.`);
            return;
        }

        setup.classList.add('hidden');
        game.classList.remove('hidden');
        players = createPlayers(playerCount);
        availableCharacters = [...characters];
        round = 0;
        startRound();
    }

    function startRound() {
        if (round >= spaces) {
            endGame();
            return;
        }
        round += 1;
        roundStartPlayer = (round - 1) % players.length;
        currentPlayer = roundStartPlayer;
        selectionCount = 0;
        decisionCount = 0;
        phase = 'selection';
        const roundCharacters = shuffle(availableCharacters).slice(0, boxesPerRound);
        availableCharacters = availableCharacters.filter(character => !roundCharacters.includes(character));
        boxes = roundCharacters.map((content, index) => ({
            id: index,
            content,
            selectedBy: null,
            revealed: false,
            used: false
        }));
        render();
    }

    function render() {
        roundInfo.textContent = `Ronda ${round} de ${spaces}`;
        phaseInfo.textContent = phase === 'selection'
            ? `Elección ${selectionCount + 1} de ${players.length}`
            : phase === 'decision'
                ? `Decisión de ${players[currentPlayer].name}`
                : phase === 'change'
                    ? `Cambio de ${players[currentPlayer].name}`
                    : 'Contenido de las cajas restantes';
        if (phase === 'selection') {
            gameMessage.textContent = `${players[currentPlayer].name}, escoge una caja misteriosa.`;
        }
        playersBoard.innerHTML = players.map((player, index) => `
            <article class="player-board ${index === currentPlayer && phase === 'decision' ? 'current-player' : ''}">
                <h2>${player.name}</h2>
                <p>${player.team.length}/${spaces} espacios ocupados</p>
                <div class="team-preview">
                    ${player.team.map(item => `<img src="${item.img || ''}" alt="${item.name}">`).join('')}
                </div>
            </article>
        `).join('');

        boxesBoard.innerHTML = boxes.map(box => `
            <button class="mystery-box ${box.revealed ? 'revealed' : ''} ${box.used ? 'used' : ''}"
                data-box-id="${box.id}" ${phase !== 'selection' && phase !== 'change' || box.selectedBy !== null || box.used ? 'disabled' : ''}>
                ${box.revealed ? `<img src="${box.content.img || ''}" alt="${box.content.name}"><strong>${box.content.name}</strong>` : '<span>?</span><small>Caja misteriosa</small>'}
            </button>
        `).join('');

        boxesBoard.querySelectorAll('.mystery-box').forEach(button => {
            button.addEventListener('click', () => {
                const boxId = Number(button.dataset.boxId);
                if (phase === 'selection') selectBox(boxId);
                if (phase === 'change') selectAlternative(boxId);
            });
        });
        decisionArea.classList.toggle('hidden', phase === 'selection');
        if (phase === 'decision') renderDecision();
        if (phase === 'change') renderChangeOptions();
        if (phase === 'reveal') renderRoundReveal();
    }

    function selectBox(boxId) {
        if (phase !== 'selection') return;
        const box = boxes.find(item => item.id === boxId);
        if (!box || box.selectedBy !== null || box.used) return;
        box.selectedBy = currentPlayer;
        selectionCount += 1;
        if (selectionCount === players.length) {
            boxes.forEach(selectedBox => {
                if (selectedBox.selectedBy !== null) selectedBox.revealed = true;
            });
            phase = 'decision';
            currentPlayer = roundStartPlayer;
            decisionCount = 0;
        } else {
            currentPlayer = (currentPlayer + 1) % players.length;
        }
        render();
    }

    function renderDecision() {
        const playerBox = boxes.find(box => box.selectedBy === currentPlayer && !box.used);
        decisionArea.innerHTML = `
            <div class="revealed-choice">
                <img src="${playerBox.content.img || ''}" alt="${playerBox.content.name}">
                <div><span>${players[currentPlayer].name}, tu caja contiene:</span><h2>${playerBox.content.name}</h2></div>
            </div>
            <div class="decision-actions">
                <button id="keep-box">Quedármela</button>
                <button id="change-box" class="secondary">Coger otra</button>
            </div>
        `;
        document.getElementById('keep-box').addEventListener('click', () => keepBox(playerBox));
        document.getElementById('change-box').addEventListener('click', () => changeBox(playerBox));
        gameMessage.textContent = 'Puedes conservar tu caja o cambiarla una única vez en esta ronda.';
    }

    function keepBox(box) {
        players[currentPlayer].team.push(box.content);
        box.used = true;
        nextDecision();
    }

    function changeBox(originalBox) {
        const alternatives = boxes.filter(box => !box.used && box.selectedBy === null);
        if (!alternatives.length) {
            gameMessage.textContent = 'No quedan cajas disponibles; se conserva la caja revelada.';
            keepBox(originalBox);
            return;
        }
        phase = 'change';
        render();
    }

    function renderChangeOptions() {
        decisionArea.innerHTML = `<p>${players[currentPlayer].name}, elige directamente una caja no seleccionada de arriba.</p>`;
        gameMessage.textContent = 'Elige exactamente una de las cajas restantes.';
    }

    function selectAlternative(boxId) {
        const originalBox = boxes.find(box => box.selectedBy === currentPlayer && !box.used);
        const alternative = boxes.find(box => box.id === boxId && !box.used && box.selectedBy === null);
        if (!originalBox || !alternative) return;
        originalBox.used = true;
        alternative.used = true;
        alternative.revealed = true;
        players[currentPlayer].team.push(alternative.content);
        phase = 'decision';
        nextDecision();
    }

    function nextDecision() {
        decisionCount += 1;
        if (decisionCount >= players.length) {
            phase = 'reveal';
            boxes.forEach(box => {
                if (!box.used) box.revealed = true;
            });
            render();
        } else {
            currentPlayer = (currentPlayer + 1) % players.length;
            render();
        }
    }

    function renderRoundReveal() {
        const nextAction = round >= spaces ? 'Ver resumen final' : 'Siguiente ronda';
        decisionArea.innerHTML = `<p>Estas son las cajas que nadie escogió en esta ronda.</p><button id="next-round">${nextAction}</button>`;
        document.getElementById('next-round').addEventListener('click', () => {
            if (round >= spaces) {
                endGame();
            } else {
                startRound();
            }
        });
        gameMessage.textContent = 'Ronda terminada. Puedes revisar el contenido de las cajas restantes.';
    }

    function endGame() {
        phaseInfo.textContent = 'Partida finalizada';
        gameMessage.textContent = 'Todos los equipos están completos.';
        boxesBoard.classList.add('hidden');
        decisionArea.classList.add('hidden');
        playersBoard.classList.add('hidden');
        finalSummary.classList.remove('hidden');
        finalSummary.innerHTML = `<h2>Equipos finales</h2><div class="summary-grid">${players.map(player => `
            <article class="summary-card"><h2>${player.name}</h2><div class="summary-team">${player.team.map(item => `
                <figure><img src="${item.img || ''}" alt="${item.name}"><figcaption>${item.name}</figcaption></figure>
            `).join('')}</div></article>
        `).join('')}</div>`;
    }

    startButton.addEventListener('click', startGame);
});
