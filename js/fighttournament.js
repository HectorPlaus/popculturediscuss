document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const bracketContainer = document.getElementById('bracket-container');
    const startButton = document.getElementById('start-tournament');

    if (!selectedCategory || !selectedCategory.characters || selectedCategory.characters.length < 2) {
        alert('No hay suficientes personajes en la categoría.');
        return;
    }

    document.getElementById('selected-category').innerText = selectedCategory.name;
    
    let characters = [...selectedCategory.characters];
    let currentRound = [];
    let nextRound = [];
    let matchesPending = 0;

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    const startTournament = () => {
        characters = shuffleArray(characters);
        currentRound = [...characters];
        createBracket(currentRound);
    };

    const createBracket = (round) => {
        bracketContainer.innerHTML = '';
        nextRound = [];
        matchesPending = Math.floor(round.length / 2);
        
        if (round.length === 1) {
            bracketContainer.innerHTML = `<h2>¡Ganador: ${round[0].name}!</h2><img id="winner-img" src="${round[0].img}" alt="${round[0].name}">`;
            return;
        }

        const matches = document.createElement('div');
        matches.classList.add('round');
        
        for (let i = 0; i < round.length; i += 2) {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('match');
        
            if (i + 1 < round.length) {
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
        
                matchDiv.querySelectorAll('.character').forEach(characterDiv => {
                    characterDiv.addEventListener('click', (e) => {
                        if (matchDiv.classList.contains('completed')) return;
        
                        matchDiv.querySelectorAll('.character').forEach(div => div.classList.remove('selected'));
                        e.currentTarget.classList.add('selected');
                        const winnerIndex = parseInt(e.currentTarget.dataset.index, 10);
                        nextRound.push(round[winnerIndex]);
                        matchDiv.classList.add('completed');
        
                        matchesPending--;
                        if (matchesPending === 0) {
                            setTimeout(() => createBracket(nextRound), 500);
                        }
                    });
                });
            } else {
                // Si es impar, el último jugador avanza automáticamente
                nextRound.push(round[i]);
        
                // Opcional: Mostrar que pasa directo a la siguiente ronda
                matchDiv.innerHTML = `
                    <div class="character" data-index="${i}">
                        <img src="${round[i].img}" alt="${round[i].name}">
                        <p>${round[i].name} avanza automáticamente</p>
                    </div>
                `;
            }
        
            matches.appendChild(matchDiv);
        }
        

        bracketContainer.appendChild(matches);
    };

    startButton.addEventListener('click', startTournament);


});
