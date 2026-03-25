let characters = [];

document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    if (selectedCategory && selectedCategory.characters) {
        characters = selectedCategory.characters.map(char => ({
            name: char.name,
            description: char.name,
            img: char.img
        }));
    } else {
        // Fallback a personajes hardcodeados si no hay categoría seleccionada
        characters = [
            { name: 'Goku', description: 'Saiyajin indomable con poder de supernova.', img: '' },
            { name: 'Naruto', description: 'Ninja que persigue ser Hokage y domina al Kyubi.', img: '' },
            { name: 'Luffy', description: 'Pirata con habilidades de goma, aspirante a Rey de los Piratas.', img: '' },
            { name: 'Saitama', description: 'Héroe invencible de un solo golpe.', img: '' },
            { name: 'Ichigo', description: 'Shinigami con alma de luchador y poder Hollow.', img: '' },
            { name: 'Deku', description: 'Joven con el poder One For All y gran corazón.', img: '' },
            { name: 'Tanjiro', description: 'Cazador de demonios con una voluntad de hierro.', img: '' }
        ];
    }
});

const state = {
    currentPlayer: 1,
    usedIndices: [],
    participants: [null, null],
    currentCharacter: null,
    roundResult: null,
};

const elements = {
    startBtn: document.getElementById('start-battle-btn'),
    resetBtn: document.getElementById('reset-btn'),
    turnInfo: document.getElementById('turn-info'),
    secretCard: document.getElementById('secret-card'),
    characterName: document.getElementById('character-name'),
    characterDesc: document.getElementById('character-desc'),
    characterImg: document.getElementById('character-img'),
    confirmViewBtn: document.getElementById('confirm-view-btn'),
    predictionText: document.getElementById('prediction-text'),
    predictionButtons: document.getElementById('prediction-buttons'),
    predictWin: document.getElementById('predict-win'),
    predictLose: document.getElementById('predict-lose'),
    winnerSelection: document.getElementById('winner-selection'),
    winnerCharacters: document.getElementById('winner-characters'),
    resultSummary: document.getElementById('result-summary'),
};

function randomIndex() {
    if (state.usedIndices.length >= characters.length) {
        state.usedIndices = []; // reset if se quedaron sin personajes
    }
    let idx;
    do {
        idx = Math.floor(Math.random() * characters.length);
    } while (state.usedIndices.includes(idx));
    state.usedIndices.push(idx);
    return idx;
}

function setTurn(player) {
    state.currentPlayer = player;
    const text = "Turno Jugador " + player + ". Revisa tu personaje secreto y predice.";
    elements.turnInfo.textContent = text;

    const idx = randomIndex();
    state.currentCharacter = characters[idx];
    elements.characterName.textContent = state.currentCharacter.name;
    elements.characterDesc.textContent = state.currentCharacter.description;
    elements.characterImg.src = state.currentCharacter.img || '';

    // Mostrar panel, pero ocultar personaje hasta confirmación
    elements.secretCard.classList.remove('hidden');
    elements.confirmViewBtn.classList.remove('hidden');
    elements.characterImg.classList.add('hidden');
    elements.characterName.classList.add('hidden');
    elements.characterDesc.classList.add('hidden');
    elements.predictionText.classList.add('hidden');
    elements.predictionButtons.classList.add('hidden');

    elements.resultSummary.classList.add('hidden');
    elements.winnerSelection.classList.add('hidden');
}

function confirmView() {
    elements.confirmViewBtn.classList.add('hidden');
    elements.characterImg.classList.remove('hidden');
    elements.characterName.classList.remove('hidden');
    elements.characterDesc.classList.remove('hidden');
    elements.predictionText.classList.remove('hidden');
    elements.predictionButtons.classList.remove('hidden');
    elements.turnInfo.textContent = "Ahora predice: Gana o Pierde.";
}

function startBattle() {
    state.usedIndices = [];
    state.participants = [null, null];
    state.currentPlayer = 1;
    state.roundResult = null;

    elements.startBtn.classList.add('hidden');
    elements.resetBtn.classList.remove('hidden');
    elements.winnerSelection.classList.add('hidden');
    setTurn(1);
}

function renderFinalResult() {
    elements.secretCard.classList.add('hidden');

    const r = state.roundResult;

    const jugador1 = state.participants[0];
    const jugador2 = state.participants[1];

    const p1Correct = (r === 1 && jugador1.prediction === 'win') || (r === 2 && jugador1.prediction === 'lose');
    const p2Correct = (r === 2 && jugador2.prediction === 'win') || (r === 1 && jugador2.prediction === 'lose');

    let consenso;
    if (p1Correct && p2Correct) {
        consenso = 'Ambos acertaron; empate de consenso.';
    } else if (p1Correct) {
        consenso = 'Jugador 1 acertó la predicción.';
    } else if (p2Correct) {
        consenso = 'Jugador 2 acertó la predicción.';
    } else {
        consenso = 'Ninguno acertó; fallaron las dos predicciones.';
    }

    elements.resultSummary.innerHTML = `
        <h3>Resultado final</h3>

        <div class="result-item">
            <strong>Jugador 1</strong><br>
            ${jugador1.character.name}<br>
            <img src="${jugador1.character.img}" alt="${jugador1.character.name}" style="width: 100px; height: auto;"><br>
            Predicción: ${jugador1.prediction}
        </div>

        <div class="result-item">
            <strong>Jugador 2</strong><br>
            ${jugador2.character.name}<br>
            <img src="${jugador2.character.img}" alt="${jugador2.character.name}" style="width: 100px; height: auto;"><br>
            Predicción: ${jugador2.prediction}
        </div>

        <div class="result-item">
            <strong>Ganador del encuentro:</strong> Jugador ${r}<br>
            <strong>Consenso:</strong> ${consenso}
        </div>
    `;

    elements.resultSummary.classList.remove('hidden');
    elements.turnInfo.textContent = "El combate terminó.";
    elements.startBtn.disabled = false;
}

function recordPrediction(prediction) {
    const current = state.currentPlayer;
    state.participants[current - 1] = {
        character: state.currentCharacter,
        prediction,
    };

    if (current === 1) {
        setTimeout(() => {
            setTurn(2);
        }, 200);
    } else {
        setTimeout(() => {
            elements.secretCard.classList.add('hidden');
            elements.winnerSelection.classList.remove('hidden');
            elements.turnInfo.textContent = "Elige quién gana la batalla.";

            elements.winnerCharacters.innerHTML = `
                <div class="winner-character-card">
                    <strong>Jugador 1:</strong><br>
                    <img src="${state.participants[0].character.img}" alt="${state.participants[0].character.name}" style="width: 80px; height: auto;"><br>
                    ${state.participants[0].character.name}<br>
                    <button id="player1-wins" class="winner-btn">Gana</button>
                </div>
                <div class="winner-character-card">
                    <strong>Jugador 2:</strong><br>
                    <img src="${state.participants[1].character.img}" alt="${state.participants[1].character.name}" style="width: 80px; height: auto;"><br>
                    ${state.participants[1].character.name}<br>
                    <button id="player2-wins" class="winner-btn">Gana</button>
                </div>
            `;
        }, 200);
    }
}

function selectWinner(winner) {
    state.roundResult = winner;
    elements.winnerSelection.classList.add('hidden');
    renderFinalResult();
}

function resetBattle() {
    elements.turnInfo.textContent = 'Presiona Iniciar Batalla para comenzar.';
    elements.secretCard.classList.add('hidden');
    elements.resultSummary.classList.add('hidden');
    elements.winnerSelection.classList.add('hidden');
    elements.resetBtn.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
    elements.confirmViewBtn.classList.add('hidden');
    elements.characterImg.classList.add('hidden');
    elements.characterName.classList.add('hidden');
    elements.characterDesc.classList.add('hidden');
    elements.predictionText.classList.add('hidden');
    elements.predictionButtons.classList.add('hidden');
    state.currentPlayer = 1;
}

document.addEventListener('DOMContentLoaded', () => {
    elements.startBtn.addEventListener('click', startBattle);
    elements.confirmViewBtn.addEventListener('click', confirmView);
    elements.predictWin.addEventListener('click', () => recordPrediction('win'));
    elements.predictLose.addEventListener('click', () => recordPrediction('lose'));
    elements.winnerCharacters.addEventListener('click', (e) => {
        if (e.target.id === 'player1-wins') selectWinner(1);
        else if (e.target.id === 'player2-wins') selectWinner(2);
    });
    elements.resetBtn.addEventListener('click', resetBattle);
});

// Por compatibilidad con JS modular y precarga de script en algunas versiones.
window.randombattle = { startBattle, resetBattle };
