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
    let soloCharacter = null;

    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    const startTournament = () => {
        characters = shuffleArray(characters);
        currentRound = [...characters];
        soloCharacter = null;
        createBracket(currentRound);
    };

    const createBracket = (round) => {
        console.log('Creando bracket para la ronda:', round);

        round = round.filter(c => c !== undefined);
        console.log('Después de filtrar undefined:', round);

        bracketContainer.innerHTML = '';
        nextRound = [];
        matchesPending = Math.floor(round.length / 2);
        let newSoloCharacter = null;

        if (round.length === 1) {
            console.log('El ganador es:', round[0].name);
            bracketContainer.innerHTML = `<h2>¡Ganador: ${round[0].name}!</h2>
                                          <img id="winner-img" src="${round[0].img}" alt="${round[0].name}">`;
            return;
        }

        const matches = document.createElement('div');
        matches.classList.add('round');

        for (let i = 0; i < round.length; i += 2) {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('match');

            const character1 = round[i];
            const character2 = round[i + 1] || null;

            console.log('Match:', character1, character2);

            if (character1 && character2) {
                matchDiv.innerHTML = `
                    <div class="character" data-index="${i}">
                        <img src="${character1.img}" alt="${character1.name}">
                        <p>${character1.name}</p>
                    </div>
                    <span>VS</span>
                    <div class="character" data-index="${i + 1}">
                        <img src="${character2.img}" alt="${character2.name}">
                        <p>${character2.name}</p>
                    </div>
                `;

                matchDiv.querySelectorAll('.character').forEach(characterDiv => {
                    characterDiv.addEventListener('click', (e) => {
                        matchDiv.querySelectorAll('.character').forEach(div => div.classList.remove('selected'));
                        e.currentTarget.classList.add('selected');

                        const winnerIndex = parseInt(e.currentTarget.dataset.index, 10);
                        matchDiv.dataset.winner = winnerIndex;

                        if (![...matchDiv.querySelectorAll('.character.selected')].length) {
                            matchDiv.classList.remove('completed');
                        } else {
                            matchDiv.classList.add('completed');
                        }

                        const allMatchesSelected = [...document.querySelectorAll('.match.completed')].length === matchesPending;

                        if (allMatchesSelected) {
                            const newRound = [...document.querySelectorAll('.match')]
                                .map(match => round[parseInt(match.dataset.winner, 10)])
                                .filter(c => c !== undefined);

                            // Si había un personaje solitario en la ronda anterior, lo agregamos si no está ya
                            if (soloCharacter && !newRound.includes(soloCharacter)) {
                                console.log('Solitario añadido a la siguiente ronda:', soloCharacter);
                                newRound.push(soloCharacter);
                            }
                            soloCharacter = null;
                            nextRound = newRound;
                            nextRound = nextRound.filter(c => c !== undefined);
                            if (soloCharacter) {
                                console.log('Solitario identificado y añadido a la siguiente ronda:', soloCharacter);
                                nextRound.push(soloCharacter);
                                soloCharacter = null; // Reiniciar para evitar que se duplique
                            }


                            setTimeout(() => createBracket(nextRound), 500);
                        }
                    });
                });

            } else if (character1) {
                matchDiv.innerHTML = `
                    <div class="character solo" data-index="${i}">
                        <img src="${character1.img}" alt="${character1.name}">
                        <p>${character1.name} avanza automáticamente</p>
                    </div>
                `;

                matchDiv.dataset.winner = i;
                if (!soloCharacter) {
                    soloCharacter = character1; // Solo se guarda si aún no hay solitario en la ronda
                    console.log('Solitario identificado y guardado:', character1);
                }
            }

            matches.appendChild(matchDiv);
        }

        bracketContainer.appendChild(matches);
    };

    startButton.addEventListener('click', startTournament);
});
