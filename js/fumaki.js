document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory')); // Recupera la categoría seleccionada
    const charactersContainer = document.getElementById('characters-container');
    const generateButton = document.getElementById('generate-characters');


    let availableCharacters = selectedCategory ? [...selectedCategory.characters] : [];
    let usedCharacters = []; // Para evitar repeticiones
    let actions = ['fuck', 'marry', 'kill']; // Acciones disponibles
    if (selectedCategory && selectedCategory.name && selectedCategory.name === "NBA Players") {
        actions = ['starter', 'bench', 'cut'];
    }
    if (!selectedCategory || !selectedCategory.characters || selectedCategory.characters.length < 3) {
        alert('No hay suficientes personajes en la categoría seleccionada.');
        return;
    }

    // Genera 3 personajes aleatorios
    const generateRandomCharacters = () => {
        if (availableCharacters.length < 3) {
            alert('No quedan suficientes personajes para generar nuevos.');
            return;
        }

        // Seleccionar 3 personajes únicos
        const selectedCharacters = [];
        while (selectedCharacters.length < 3) {
            const randomIndex = Math.floor(Math.random() * availableCharacters.length);
            const character = availableCharacters[randomIndex];
            if (!usedCharacters.includes(character.name)) {
                selectedCharacters.push(character);
                usedCharacters.push(character.name);
                availableCharacters.splice(randomIndex, 1);
            }
        }

        renderCharacters(selectedCharacters);
    };

    // Renderiza los personajes en la página
    const renderCharacters = (characters) => {
        charactersContainer.innerHTML = '';
        actions = ['fuck', 'marry', 'kill'];
        if (selectedCategory && selectedCategory.name && selectedCategory.name === "NBA Players") {
            actions = ['starter', 'bench', 'cut'];
        }
        characters.forEach((character) => {
            const characterCard = document.createElement('div');
            characterCard.classList.add('character-card');
            characterCard.innerHTML = `
                <img src="${character.img || 'placeholder.png'}" alt="${character.name}">
                <h3>${character.name}</h3>
                <div class="action-buttons">
                    ${actions
                    .map(
                        (action) =>
                            `<button class="action-button" data-action="${action}" data-name="${character.name}">
                                    ${action.charAt(0).toUpperCase() + action.slice(1)}
                                </button>`
                    )
                    .join('')}
                </div>
            `;
            charactersContainer.appendChild(characterCard);
        });

        setupActionButtons();
    };

    // Configura los botones de acción
    const setupActionButtons = () => {
        const actionButtons = document.querySelectorAll('.action-button');

        actionButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                const characterName = event.target.dataset.name;

                // Deshabilitar la acción seleccionada en todos los personajes
                document
                    .querySelectorAll(`.action-button[data-action="${action}"]`)
                    .forEach((btn) => btn.setAttribute('disabled', true));

                // Eliminar la acción de la lista
                actions = actions.filter((a) => a !== action);

                // Deshabilitar los botones restantes del personaje seleccionado
                document
                    .querySelectorAll(`.character-card h3`)
                    .forEach((name) => {
                        if (name.textContent === characterName) {
                            const parent = name.closest('.character-card');
                            parent.querySelectorAll('.action-button').forEach((btn) => {
                                btn.setAttribute('disabled', true);


                            });
                            // Crear un nuevo elemento para mostrar la acción seleccionada
                            const actionSelected = document.createElement('div');
                            actionSelected.classList.add('action-selected');
                            actionSelected.textContent = action.charAt(0).toUpperCase() + action.slice(1);
                            parent.appendChild(actionSelected);
                        }
                    });

                // Si se han usado todas las acciones, mostrar el botón para generar nuevos personajes
                if (actions.length === 0) {
                    generateButton.style.display = 'block';
                }
            });
        });
    };

    // Generar nuevos personajes al hacer clic en el botón
    generateButton.addEventListener('click', () => {
        generateButton.style.display = 'none';
        generateRandomCharacters();
    });

    // Iniciar el juego generando los primeros 3 personajes
    generateRandomCharacters();
});
