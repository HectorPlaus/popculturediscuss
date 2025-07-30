document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const tierListContainer = document.getElementById('tierlist-container');
    const addTierButton = document.getElementById('add-tier');
    const unassignedCharactersContainer = document.getElementById('unassigned-characters');

    if (!selectedCategory || !selectedCategory.characters) {
        alert('No hay personajes en la categoría.');
        return;
    }

    document.getElementById('selected-category').innerText = selectedCategory.name;

    const defaultTiers = ['S', 'A', 'B', 'C', 'F'];
    let tiers = defaultTiers.map(name => ({ name, characters: [], color: '#ffffff' }));
    let unassignedCharacters = [...selectedCategory.characters];

    const renderTierList = () => {
        tierListContainer.innerHTML = '';
        unassignedCharactersContainer.innerHTML = '';
    
        tiers.forEach((tier, index) => {
            const tierRow = document.createElement('div');
            tierRow.classList.add('tier-row');
            tierRow.style.backgroundColor = tier.color;
    
            const tierNameDiv = document.createElement('div');
            tierNameDiv.classList.add('tier-name');
            tierNameDiv.contentEditable = true;
            tierNameDiv.innerText = tier.name;
    
            const tierDropzone = document.createElement('div');
            tierDropzone.classList.add('tier-dropzone');
            tierDropzone.dataset.index = index;
    
            tierDropzone.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            };
    
            tierDropzone.ondrop = (e) => {
                e.preventDefault();
                const character = JSON.parse(e.dataTransfer.getData('text/plain'));
                const tierIndex = Number(e.target.dataset.index);
    
                // Eliminar el personaje de todos los tiers antes de agregarlo al nuevo
                tiers.forEach(tier => {
                    tier.characters = tier.characters.filter(c => c.name !== character.name);
                });
                
                // Si no está ya en el tier destino, agregarlo
                if (!tiers[tierIndex].characters.some(c => c.name === character.name)) {
                    tiers[tierIndex].characters.push(character);
                    // Eliminar el personaje de la lista de no asignados
                    unassignedCharacters = unassignedCharacters.filter(c => c.name !== character.name);
                    renderTierList();
                }
            };
    
            // Añadir los personajes al tier actual
            tier.characters.forEach(character => {
                const charDiv = document.createElement('div');
                charDiv.classList.add('character');
                charDiv.draggable = true;
                charDiv.innerHTML = `<img src="${character.img}" alt="${character.name}"><p>${character.name}</p>`;
    
                charDiv.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify(character));
                    e.dataTransfer.effectAllowed = 'move';
                };
    
                tierDropzone.appendChild(charDiv);
            });
    
            const moveRowDiv = document.createElement('div');
            moveRowDiv.classList.add('move-row');
            const moveUpDiv = document.createElement('div');
            moveUpDiv.classList.add('move-up');
            moveUpDiv.innerHTML = `<i class="fas fa-sort-up"></i>`;
            moveUpDiv.onclick = () => {
                if (index > 0) {
                    [tiers[index], tiers[index - 1]] = [tiers[index - 1], tiers[index]];
                    renderTierList();
                }
            };
    
            const moveDownDiv = document.createElement('div');
            moveDownDiv.classList.add('move-down');
            moveDownDiv.innerHTML = `<i class="fas fa-sort-down"></i>`;
            moveDownDiv.onclick = () => {
                if (index < tiers.length - 1) {
                    [tiers[index], tiers[index + 1]] = [tiers[index + 1], tiers[index]];
                    renderTierList();
                }
            };
            moveRowDiv.appendChild(moveUpDiv);
            moveRowDiv.appendChild(moveDownDiv);
    
            const tierSettings = document.createElement('div');
            tierSettings.classList.add('tier-settings');
            tierSettings.innerHTML = `<i class="fas fa-cog"></i>`;
            tierSettings.onclick = () => openSettings(index);
    
            const tierContainer = document.createElement('div');
            tierContainer.classList.add('tier-container');
            tierContainer.dataset.index = index;
            tierContainer.appendChild(tierNameDiv);
            tierContainer.appendChild(tierDropzone);
            tierContainer.appendChild(moveRowDiv);
            tierContainer.appendChild(tierSettings);
            tierListContainer.appendChild(tierContainer);
        });
    
        // Mostrar personajes no asignados
        unassignedCharacters.forEach(character => {
            const charDiv = document.createElement('div');
            charDiv.classList.add('character');
            charDiv.draggable = true;
            charDiv.innerHTML = `<img src="${character.img}" alt="${character.name}"><p>${character.name}</p>`;
    
            charDiv.ondragstart = (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(character));
                e.dataTransfer.effectAllowed = 'move';
            };
    
            unassignedCharactersContainer.appendChild(charDiv);
        });
    
        // Reasignar drag and drop a las zonas
        document.querySelectorAll('.tier-dropzone').forEach(zone => {
            zone.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            };
            zone.ondrop = (e) => {
                e.preventDefault();
                const character = JSON.parse(e.dataTransfer.getData('text/plain'));
                const tierIndex = Number(e.target.dataset.index);
    
                // Eliminar el personaje de todos los tiers antes de agregarlo al nuevo
                tiers.forEach(tier => {
                    tier.characters = tier.characters.filter(c => c.name !== character.name);
                });
    
                // Si no está ya en el tier destino, agregarlo
                if (!tiers[tierIndex].characters.some(c => c.name === character.name)) {
                    tiers[tierIndex].characters.push(character);
                    unassignedCharacters = unassignedCharacters.filter(c => c.name !== character.name);
                    renderTierList();
                }
            };
        });
    };
    

    const openSettings = (tierIndex) => {
        const settingsWindow = document.getElementById('settings-window');
        const settingsOverlay = document.getElementById('settings-overlay');
        settingsWindow.style.display = 'block';
        settingsOverlay.style.display = 'block';
        settingsWindow.dataset.tierIndex = tierIndex;

        document.getElementById('background-color').value = tiers[tierIndex].color;

        document.getElementById('background-color').oninput = (e) => {
            tiers[tierIndex].color = e.target.value;
            renderTierList();
        };

        document.getElementById('add-row-above').onclick = () => {
            tiers.splice(tierIndex, 0, { name: "Nueva Fila", characters: [], color: '#ffffff' });
            renderTierList();
        };

        document.getElementById('add-row-below').onclick = () => {
            tiers.splice(tierIndex + 1, 0, { name: "Nueva Fila", characters: [], color: '#ffffff' });
            renderTierList();
        };

        document.getElementById('delete-row').onclick = () => {
            if (tiers.length > 1) {
                tiers.splice(tierIndex, 1);
                renderTierList();
                settingsWindow.style.display = 'none';
                settingsOverlay.style.display = 'none';
            } else {
                alert("No puedes eliminar la última fila.");
            }
        };

        document.getElementById('close-settings').onclick = () => {
            settingsWindow.style.display = 'none';
            settingsOverlay.style.display = 'none';
        };

        settingsOverlay.onclick = () => {
            settingsWindow.style.display = 'none';
            settingsOverlay.style.display = 'none';
        };
    };

    renderTierList();
});
