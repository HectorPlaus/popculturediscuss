document.addEventListener('DOMContentLoaded', () => {
  // Variables principales
  const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
  const draftResults = JSON.parse(localStorage.getItem('draftResults')) || [];
  const resultsContainer = document.getElementById('results-container');

  // Mostrar mensaje si no hay resultados
  if (!draftResults.length) {
    resultsContainer.textContent = 'No hay resultados disponibles.';
    return;
  }

  // Mostrar la categoría seleccionada (si existe)
  if (selectedCategory) {
    const categoryName = document.createElement('p');
    categoryName.textContent = `Categoría: ${selectedCategory.name}`;
    resultsContainer.appendChild(categoryName);
  }

  // Variables para gestionar el intercambio
  let selectedCharacter = null;

  // Crear la interfaz inicial
  function renderDraftResults() {
    // Limpiar el contenedor
    resultsContainer.innerHTML = '';

    // Mostrar cada jugador y sus personajes
    draftResults.forEach((selections, playerIndex) => {
      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player-selections');

      // Título del jugador
      const playerTitle = document.createElement('h3');
      playerTitle.textContent = `Jugador ${playerIndex + 1}`;
      playerDiv.appendChild(playerTitle);

      // Contenedor de personajes
      const charactersContainer = document.createElement('div');
      charactersContainer.classList.add('characters-container');

      // Agregar cada personaje al contenedor
      selections.forEach((character, characterIndex) => {
        const charDiv = document.createElement('div');
        charDiv.classList.add('character-item');
        charDiv.dataset.playerIndex = playerIndex;
        charDiv.dataset.characterIndex = characterIndex;

        // Imagen y nombre del personaje
        const charImg = document.createElement('img');
        charImg.src = character.img;
        charImg.alt = character.name;

        const charName = document.createElement('p');
        charName.textContent = character.name;

        charDiv.appendChild(charImg);
        charDiv.appendChild(charName);
        charactersContainer.appendChild(charDiv);

        // Evento para seleccionar personajes
        charDiv.addEventListener('click', () => handleCharacterSelection(playerIndex, characterIndex, charDiv));
      });

      playerDiv.appendChild(charactersContainer);
      resultsContainer.appendChild(playerDiv);
    });
  }

  // Manejar la selección e intercambio de personajes
  function handleCharacterSelection(playerIndex, characterIndex, charDiv) {
    // Si ya hay un personaje seleccionado, realizar el intercambio
    if (selectedCharacter) {
      const [prevPlayerIndex, prevCharacterIndex] = selectedCharacter;

      // Intercambiar personajes en el array
      const temp = draftResults[prevPlayerIndex][prevCharacterIndex];
      draftResults[prevPlayerIndex][prevCharacterIndex] = draftResults[playerIndex][characterIndex];
      draftResults[playerIndex][characterIndex] = temp;

      // Guardar cambios en localStorage
      localStorage.setItem('draftResults', JSON.stringify(draftResults));

      // Actualizar la interfaz
      selectedCharacter = null; // Limpiar selección
      renderDraftResults();
    } else {
      // Seleccionar el primer personaje
      selectedCharacter = [playerIndex, characterIndex];

      // Resaltar el personaje seleccionado
      document.querySelectorAll('.character-item').forEach(item => item.classList.remove('selected'));
      charDiv.classList.add('selected');
    }
  }

  // Inicializar la interfaz
  renderDraftResults();
});
