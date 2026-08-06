document.addEventListener('DOMContentLoaded', () => {
    console.log('Draft.js loaded');

    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const selectedCategoryText = document.getElementById('selected-category');
    const characterListContainer = document.getElementById('character-list');
    const sortOrderSelect = document.getElementById('sort-order');
    const startDraftBtn = document.getElementById('start-draft');
    const maxRoundsBtn = document.getElementById('max-rounds-btn');
    const roundsInput = document.getElementById('rounds');
    const participantsInput = document.getElementById('participants');
    const draftSection = document.getElementById('draft-setup');
    const roundsInfo = document.createElement('div');
    roundsInfo.id = 'rounds-info';
    roundsInfo.classList.add('rounds-info');

    let selectedParticipants = 0;
    let selectedRounds = 0;
    let currentParticipant = 0;
    let remainingRounds = 0;
    let draftInProgress = false;
    let participantsSelections = [];
    let availableCharacters = [];
    let currentSortMode = 'name';

    const parseExtraValue = (extra) => {
        if (extra === undefined || extra === null) return null;
        if (typeof extra === 'number') return extra;
        const extraString = String(extra).trim();
        if (!extraString) return null;
        const numberMatch = extraString.match(/-?\d+(?:\.\d+)?/);
        if (numberMatch) return Number(numberMatch[0]);
        return extraString.toLowerCase();
    };

    const sortCharacters = (characters) => {
        const sorted = [...characters];
        if (currentSortMode === 'extra') {
            return sorted.sort((a, b) => {
                const valueA = parseExtraValue(a.extra);
                const valueB = parseExtraValue(b.extra);

                if (valueA === null && valueB === null) {
                    return a.name.localeCompare(b.name);
                }
                if (valueA === null) return 1;
                if (valueB === null) return -1;

                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return valueA - valueB || a.name.localeCompare(b.name);
                }
                if (typeof valueA === 'number') return -1;
                if (typeof valueB === 'number') return 1;

                return String(valueA).localeCompare(String(valueB)) || a.name.localeCompare(b.name);
            });
        }

        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    };

    if (selectedCategory) {
        selectedCategoryText.textContent = `${selectedCategory.name}`;
        availableCharacters = [...selectedCategory.characters];
    } else {
        alert('No se ha seleccionado ninguna categoría.');
        return;
    }

    function displayCharacters(characters) {
        characterListContainer.innerHTML = '';

        const sortedCharacters = sortCharacters(characters);

        sortedCharacters.forEach(character => {
            const characterItem = document.createElement('div');
            characterItem.classList.add('character-item');

            const characterName = document.createElement('p');
            characterName.textContent = character.name;

            const characterImage = document.createElement('img');
            characterImage.src = character.img;
            characterImage.alt = character.name;

            characterItem.appendChild(characterName);
            characterItem.appendChild(characterImage);

            characterItem.addEventListener('click', () => selectCharacter(character));

            characterListContainer.appendChild(characterItem);
        });
    }

    function selectCharacter(character) {
        if (draftInProgress) {
            availableCharacters = availableCharacters.filter(c => c.name !== character.name);
            participantsSelections[currentParticipant].push(character);

            currentParticipant = (currentParticipant + 1) % selectedParticipants;
            if (currentParticipant === 0) {
                remainingRounds--;
                if (remainingRounds === 0) {
                    draftInProgress = false;
                    saveResultsAndRedirect(); // Guardar resultados y redirigir a la página de resultados
                    return;
                }
            }

            updateRoundInfo();
            displayCharacters(availableCharacters);
        }
    }

    function updateRoundInfo() {
        roundsInfo.textContent = `Rondas restantes: ${remainingRounds} | Turno del Participante ${currentParticipant + 1}`;
    }

    function startDraft() {
        selectedParticipants = parseInt(participantsInput.value);
        selectedRounds = parseInt(roundsInput.value);

        if (selectedParticipants > 0 && selectedRounds > 0 && availableCharacters.length > 0) {
            remainingRounds = selectedRounds;
            draftInProgress = true;
            currentParticipant = 0;

            participantsSelections = Array.from({ length: selectedParticipants }, () => []);

            draftSection.classList.add('hidden');
            draftSection.insertAdjacentElement('beforeend', roundsInfo);
            displayCharacters(availableCharacters);
            updateRoundInfo();
        } else {
            alert('Por favor, ingrese valores válidos para participantes, rondas y asegúrese de tener personajes disponibles.');
        }
    }

    function calculateMaxRounds() {
        const participants = parseInt(participantsInput.value);
        if (participants > 0 && availableCharacters.length > 0) {
            const maxRounds = Math.floor(availableCharacters.length / participants);
            roundsInput.value = maxRounds;
        } else {
            alert('Por favor, ingrese un número válido de participantes.');
        }
    }

    function saveResultsAndRedirect() {
        localStorage.setItem('draftResults', JSON.stringify(participantsSelections));
        window.location.href = 'results.html'; // Redirigir a la página de resultados
    }

    sortOrderSelect?.addEventListener('change', (event) => {
        currentSortMode = event.target.value;
        displayCharacters(availableCharacters);
    });

    maxRoundsBtn.addEventListener('click', calculateMaxRounds);
    startDraftBtn.addEventListener('click', startDraft);
});
