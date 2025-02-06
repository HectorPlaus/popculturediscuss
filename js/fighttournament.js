document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const bracketContainer = document.getElementById('bracket-container');
    const startButton = document.getElementById('start-tournament');

    if (!selectedCategory || !selectedCategory.characters || selectedCategory.characters.length < 2) {
        alert('No hay suficientes personajes en la categoría.');
        return;
    }

    document.getElementById('selected-category').innerText = `Categoría: ${selectedCategory.name}`;
    
    let characters = [...selectedCategory.characters];
    let currentRound = [];

    const startTournament = () => {
        currentRound = [...characters];
        createBracket(currentRound);
    };

    const createBracket = (round) => {
        bracketContainer.innerHTML = '';

        if (round.length === 1) {
            bracketContainer.innerHTML = `<h2>¡Ganador: ${round[0].name}!</h2><img src="${round[0].img}" alt="${round[0].name}">`;
            return;
        }

        const nextRound = [];
        for (let i = 0; i < round.length; i += 2) {
            if (i + 1 < round.length) {
                const matchDiv = document.createElement('div');
                matchDiv.classList.add('match');
                matchDiv.innerHTML = `
                    <div class="character" data-index="${i}">
                        <img src="${round[i].img}" alt="${round[i].name}">
                        <p>${round[i].name}</p>
                    </div>
                    <span>VS</span>
                    <div class="character" data-index="${i + 1}">
                        <img src="${round[i + 1].img}" alt="${round[i + 1].name}">
                        <p>${round[i + 1].name}</p>
                    </div>
                `;

                matchDiv.addEventListener('click', (e) => {
                    if (e.target.closest('.character')) {
                        const winnerIndex = parseInt(e.target.closest('.character').dataset.index, 10);
                        nextRound.push(round[winnerIndex]);
                        createBracket(nextRound);
                    }
                });

                bracketContainer.appendChild(matchDiv);
            } else {
                nextRound.push(round[i]);
            }
        }
    };

    startButton.addEventListener('click', startTournament);
});
