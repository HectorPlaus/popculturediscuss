document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const categoryTitle = document.getElementById('selected-category');
    const info = document.getElementById('info');
    const roundsInfo = document.getElementById('rounds-info');
    const pairContainer = document.getElementById('pair-container');

    const imgA = document.getElementById('img-a');
    const nameA = document.getElementById('name-a');
    const imgB = document.getElementById('img-b');
    const nameB = document.getElementById('name-b');

    const cardA = document.getElementById('card-a');
    const cardB = document.getElementById('card-b');
    const endGameContainer = document.getElementById('end-game');
    const championImg = document.getElementById('champion-img');
    const championName = document.getElementById('champion-name');
    const restartBtn = document.getElementById('restart');

    let allCharacters = [];
    let pool = [];
    let currentA = null;
    let currentB = null;
    let roundsCompleted = 0;
    let totalRounds = 0;

    if (!selectedCategory || !selectedCategory.characters || selectedCategory.characters.length < 2) {
        alert('Selecciona una categoría con al menos 2 personajes para jugar.');
        window.location.href = 'mode.html';
        return;
    }

    categoryTitle.textContent = selectedCategory.name;
    allCharacters = [...selectedCategory.characters];

    const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };

    const draw = () => {
        if (pool.length === 0) return null;
        const index = Math.floor(Math.random() * pool.length);
        return pool.splice(index, 1)[0];
    };

    const updateInfo = () => {
        roundsInfo.textContent = `Rondas completadas: ${roundsCompleted} / ${totalRounds}`;
       
    };

    const showPair = () => {
        if (!currentA || !currentB) return;
        pairContainer.style.display = 'flex';
        info.style.display = 'block';
        imgA.src = currentA.img || 'placeholder.png';
        imgA.alt = currentA.name;
        nameA.textContent = currentA.name;

        imgB.src = currentB.img || 'placeholder.png';
        imgB.alt = currentB.name;
        nameB.textContent = currentB.name;

        endGameContainer.style.display = 'none';
    };

    const endGame = (finalWinner) => {
        pairContainer.style.display = 'none';
        info.style.display = 'none';
        endGameContainer.style.display = 'block';
        
        if (finalWinner) {
            championImg.src = finalWinner.img || 'placeholder.png';
            championImg.alt = finalWinner.name;
            championName.textContent = finalWinner.name;
        } else {
            championImg.src = '';
            championName.textContent = 'Sin campeón';
        }
        
        roundsCompleted = totalRounds;
        updateInfo();
    };

    const nextRound = (winner, loser, winnerPosition) => {
        roundsCompleted += 1;

        if (pool.length === 0) {
            // se termina tras la última selección
            currentA = winnerPosition === 'A' ? winner : null;
            currentB = winnerPosition === 'B' ? winner : null;
            endGame(winner);
            return;
        }

        const nextCandidate = draw();
        if (!nextCandidate) {
            currentA = winnerPosition === 'A' ? winner : null;
            currentB = winnerPosition === 'B' ? winner : null;
            endGame(winner);
            return;
        }

        // El personaje seleccionado se queda en la misma tarjeta, la otra se reemplaza
        if (winnerPosition === 'A') {
            currentA = winner;
            currentB = nextCandidate;
        } else {
            currentA = nextCandidate;
            currentB = winner;
        }

        updateInfo();
        showPair();
    };

    const handleSelection = (selectedChar, otherChar, winnerPosition) => {
        if (!selectedChar || !otherChar) return;
        nextRound(selectedChar, otherChar, winnerPosition);
    };

    const startGame = () => {
        pool = [...allCharacters];
        shuffle(pool);

        currentA = draw();
        currentB = draw();
        roundsCompleted = 0;
        totalRounds = allCharacters.length - 1;

        updateInfo();
        showPair();
        info.style.display = 'block';
        endGameContainer.style.display = 'none';
    };

    const selectCharacterA = () => {
        handleSelection(currentA, currentB, 'A');
    };

    const selectCharacterB = () => {
        handleSelection(currentB, currentA, 'B');
    };

    cardA.addEventListener('click', selectCharacterA);
    cardB.addEventListener('click', selectCharacterB);

    restartBtn.addEventListener('click', () => {
        startGame();
    });

    startGame();
});