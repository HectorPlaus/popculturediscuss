document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const tierListContainer = document.getElementById('tierlist-container');
    const sortOrderSelect = document.getElementById('sort-order');
    const unassignedCharactersContainer = document.getElementById('unassigned-characters');
    const resetButton = document.getElementById('reset-tierlist');
    const addTierRowButton = document.getElementById('add-tier-row');
    const settingsWindow = document.getElementById('settings-window');
    const settingsOverlay = document.getElementById('settings-overlay');
    const backgroundColorInput = document.getElementById('background-color');
    const titleInput = document.getElementById('row-title');

    if (!selectedCategory || !selectedCategory.characters) {
        alert('No hay personajes en la categoría.');
        return;
    }

    document.getElementById('selected-category').innerText = selectedCategory.name;

    const defaultTiers = ['S', 'A', 'B', 'C', 'F'];
    const baseCharacters = [...selectedCategory.characters];
    let tiers = defaultTiers.map(name => ({ name, characters: [], color: '#ffffff' }));
    let unassignedCharacters = [...baseCharacters];
    let draggedCharacter = null;
    let selectedCharacters = [];
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

    const getCharacterId = (character) => `${character.name}-${character.img || ''}`;

    const getCharacterKey = (character) => `${character.name}-${character.img || ''}`;

    const getTierlistStorageKey = () => {
        const categoryKey = selectedCategory.id || selectedCategory.name || 'default';
        return `tierlist-state-${categoryKey}`;
    };

    const saveTierlistState = () => {
        const state = {
            tiers,
            unassignedCharacters,
            categoryName: selectedCategory.name
        };
        localStorage.setItem(getTierlistStorageKey(), JSON.stringify(state));
    };

    const loadTierlistState = () => {
        const storedState = localStorage.getItem(getTierlistStorageKey());

        if (!storedState) {
            return null;
        }

        try {
            const parsedState = JSON.parse(storedState);
            if (!parsedState || !Array.isArray(parsedState.tiers) || !Array.isArray(parsedState.unassignedCharacters)) {
                return null;
            }

            return parsedState;
        } catch (error) {
            console.error('No se pudo cargar el estado de la tierlist.', error);
            return null;
        }
    };

    const restoreTierlistState = () => {
        const storedState = loadTierlistState();

        if (!storedState) {
            tiers = defaultTiers.map(name => ({ name, characters: [], color: '#ffffff' }));
            unassignedCharacters = [...baseCharacters];
            return;
        }

        tiers = storedState.tiers.map(tier => ({
            ...tier,
            characters: Array.isArray(tier.characters) ? tier.characters : []
        }));
        unassignedCharacters = Array.isArray(storedState.unassignedCharacters)
            ? [...storedState.unassignedCharacters]
            : [...baseCharacters];
    };

    restoreTierlistState();

    const toggleCharacterSelection = (character) => {
        const key = getCharacterKey(character);
        const exists = selectedCharacters.some(item => getCharacterKey(item) === key);

        if (exists) {
            selectedCharacters = selectedCharacters.filter(item => getCharacterKey(item) !== key);
        } else {
            selectedCharacters.push(character);
        }

        renderTierList();
    };

    const createCharacterCard = (character, source = 'unassigned', tierIndex = null) => {
        const charDiv = document.createElement('div');
        charDiv.classList.add('character');
        charDiv.draggable = true;
        charDiv.dataset.characterKey = getCharacterKey(character);
        charDiv.dataset.source = source;
        charDiv.dataset.tierIndex = source === 'tier' ? String(tierIndex) : '-1';
        const isSelected = selectedCharacters.some(item => getCharacterKey(item) === getCharacterKey(character));
        if (isSelected) {
            charDiv.classList.add('is-selected');
        }
        charDiv.innerHTML = `<img src="${character.img}" alt="${character.name}"><p>${character.name}</p>`;

        charDiv.addEventListener('click', (event) => {
            if (event.shiftKey) {
                toggleCharacterSelection(character);
            } else {
                toggleCharacterSelection(character);
            }
        });

        charDiv.addEventListener('dragstart', (event) => {
            const isCurrentCharacterSelected = selectedCharacters.some(item => getCharacterKey(item) === getCharacterKey(character));
            const charactersToDrag = (selectedCharacters.length > 0 && isCurrentCharacterSelected)
                ? selectedCharacters
                : [character];

            draggedCharacter = charactersToDrag[0];
            charDiv.classList.add('is-dragging');
            event.dataTransfer.setData('text/plain', JSON.stringify({
                characters: charactersToDrag,
                source: {
                    kind: source,
                    tierIndex: source === 'tier' ? tierIndex : null
                }
            }));
            event.dataTransfer.effectAllowed = 'move';
        });

        charDiv.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
            charDiv.classList.add('drag-over');
        });

        charDiv.addEventListener('dragleave', (event) => {
            event.stopPropagation();
            charDiv.classList.remove('drag-over');
        });

        charDiv.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            charDiv.classList.remove('drag-over');
            const payload = event.dataTransfer.getData('text/plain');

            if (!payload) {
                return;
            }

            try {
                const parsedPayload = JSON.parse(payload);
                const charactersToMove = Array.isArray(parsedPayload?.characters)
                    ? parsedPayload.characters
                    : [parsedPayload];
                const targetTierIndex = Number(charDiv.dataset.tierIndex);
                const resolvedTargetTierIndex = Number.isNaN(targetTierIndex) || targetTierIndex < 0 ? null : targetTierIndex;

                moveCharactersToTier(charactersToMove, resolvedTargetTierIndex, charDiv.dataset.characterKey);
                selectedCharacters = [];
                renderTierList();
            } catch (error) {
                console.error('No se pudo procesar el movimiento.', error);
            }
        });

        charDiv.addEventListener('dragend', () => {
            draggedCharacter = null;
            charDiv.classList.remove('is-dragging');
            document.querySelectorAll('.tier-dropzone').forEach(zone => zone.classList.remove('drag-over'));
            document.querySelectorAll('.character').forEach(card => card.classList.remove('drag-over'));
        });

        return charDiv;
    };

    const moveCharactersToTier = (characters, targetTierIndex, targetCharacterKey = null) => {
        const charactersToMove = Array.isArray(characters) ? characters : [characters];

        if (!charactersToMove.length) {
            return;
        }

        const characterKeysToMove = new Set(charactersToMove.map(getCharacterKey));

        tiers.forEach(tier => {
            tier.characters = tier.characters.filter(c => !characterKeysToMove.has(getCharacterKey(c)));
        });

        unassignedCharacters = unassignedCharacters.filter(c => !characterKeysToMove.has(getCharacterKey(c)));

        if (targetTierIndex === null || targetTierIndex === undefined) {
            unassignedCharacters = [...unassignedCharacters, ...charactersToMove];
            saveTierlistState();
            return;
        }

        if (!tiers[targetTierIndex]) {
            saveTierlistState();
            return;
        }

        const targetTier = tiers[targetTierIndex];
        const remainingCharacters = [...targetTier.characters].filter(c => !characterKeysToMove.has(getCharacterKey(c)));

        let insertIndex = remainingCharacters.length;
        if (targetCharacterKey) {
            const targetIndex = remainingCharacters.findIndex(c => getCharacterKey(c) === targetCharacterKey);
            if (targetIndex >= 0) {
                insertIndex = targetIndex;
            }
        }

        targetTier.characters = [
            ...remainingCharacters.slice(0, insertIndex),
            ...charactersToMove,
            ...remainingCharacters.slice(insertIndex)
        ];

        saveTierlistState();
    };

    const renderTierList = () => {
        tierListContainer.innerHTML = '';
        unassignedCharactersContainer.innerHTML = '';

        const unassignedHeader = document.createElement('div');
        unassignedHeader.className = 'unassigned-header';
        unassignedHeader.innerHTML = '<strong>Sin asignar</strong>';
        unassignedCharactersContainer.appendChild(unassignedHeader);

       

        tiers.forEach((tier, index) => {
            const tierContainer = document.createElement('div');
            tierContainer.classList.add('tier-container');
            tierContainer.dataset.index = index;
            tierContainer.style.backgroundColor = tier.color;


            const tierNameDiv = document.createElement('div');
            tierNameDiv.classList.add('tier-name');
            tierNameDiv.innerText = tier.name;
            tierNameDiv.title = 'Edita el nombre desde Ajustes';

            const tierDropzone = document.createElement('div');
            tierDropzone.classList.add('tier-dropzone');
            tierDropzone.dataset.index = index;
            tierDropzone.setAttribute('aria-label', `Zona para ${tier.name}`);

            tierDropzone.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                tierDropzone.classList.add('drag-over');
            });

            tierDropzone.addEventListener('dragleave', () => {
                tierDropzone.classList.remove('drag-over');
            });

            tierDropzone.addEventListener('drop', (event) => {
                event.preventDefault();
                tierDropzone.classList.remove('drag-over');
                const characterData = event.dataTransfer.getData('text/plain');
                const tierIndex = Number(event.currentTarget.dataset.index);
                const resolvedTierIndex = Number.isNaN(tierIndex) ? null : tierIndex;

                if (characterData) {
                    try {
                        const parsedCharacters = JSON.parse(characterData);
                        const charactersToMove = Array.isArray(parsedCharacters?.characters)
                            ? parsedCharacters.characters
                            : [parsedCharacters];
                        moveCharactersToTier(charactersToMove, resolvedTierIndex);
                        selectedCharacters = [];
                        renderTierList();
                        return;
                    } catch (error) {
                        console.error('No se pudo procesar el movimiento.', error);
                    }
                }

                if (selectedCharacters.length > 0) {
                    moveCharactersToTier(selectedCharacters, resolvedTierIndex);
                    selectedCharacters = [];
                    renderTierList();
                }
            });

            // Mantener el orden manual dentro de cada fila (no aplicar sort aquí)
            if (tier.characters.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-dropzone';
                    emptyMessage.textContent = '';
                    tierDropzone.appendChild(emptyMessage);
                } else {
                    tier.characters.forEach(character => tierDropzone.appendChild(createCharacterCard(character, 'tier', index)));
                }

            const moveRowDiv = document.createElement('div');
            moveRowDiv.classList.add('move-row');
            const moveUpDiv = document.createElement('div');
            moveUpDiv.classList.add('move-up');
            moveUpDiv.innerHTML = '<i class="fas fa-sort-up"></i>';
            moveUpDiv.onclick = () => {
                if (index > 0) {
                    [tiers[index], tiers[index - 1]] = [tiers[index - 1], tiers[index]];
                    saveTierlistState();
                    renderTierList();
                }
            };

            const moveDownDiv = document.createElement('div');
            moveDownDiv.classList.add('move-down');
            moveDownDiv.innerHTML = '<i class="fas fa-sort-down"></i>';
            moveDownDiv.onclick = () => {
                if (index < tiers.length - 1) {
                    [tiers[index], tiers[index + 1]] = [tiers[index + 1], tiers[index]];
                    saveTierlistState();
                    renderTierList();
                }
            };
            moveRowDiv.appendChild(moveUpDiv);
            moveRowDiv.appendChild(moveDownDiv);

            const tierSettings = document.createElement('div');
            tierSettings.classList.add('tier-settings');
            tierSettings.innerHTML = '<i class="fas fa-cog"></i>';
            tierSettings.onclick = () => openSettings(index);

            tierContainer.appendChild(tierNameDiv);
            tierContainer.appendChild(tierDropzone);
            tierContainer.appendChild(moveRowDiv);
            tierContainer.appendChild(tierSettings);
            tierListContainer.appendChild(tierContainer);
        });

        const sortedUnassignedCharacters = sortCharacters(unassignedCharacters);
        if (sortedUnassignedCharacters.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-dropzone';
            emptyState.textContent = 'Ya no quedan personajes por asignar.';
            unassignedCharactersContainer.appendChild(emptyState);
        } else {
            sortedUnassignedCharacters.forEach(character => {
                const charDiv = createCharacterCard(character, 'unassigned');
                unassignedCharactersContainer.appendChild(charDiv);
            });
        }
    };

    const openSettings = (tierIndex) => {
        settingsWindow.style.display = 'block';
        settingsOverlay.style.display = 'block';
        settingsWindow.dataset.tierIndex = tierIndex;

        if (backgroundColorInput) {
            backgroundColorInput.value = tiers[tierIndex].color;
        }

        if (titleInput) {
            titleInput.value = tiers[tierIndex].name;
        }

        if (backgroundColorInput) {
            backgroundColorInput.oninput = (e) => {
                tiers[tierIndex].color = e.target.value;
                saveTierlistState();
                renderTierList();
            };
        }

        if (titleInput) {
            titleInput.oninput = (e) => {
                tiers[tierIndex].name = e.target.value.trim() || 'Nueva Fila';
                saveTierlistState();
                renderTierList();
            };
        }

        document.getElementById('add-row-above').onclick = () => {
            tiers.splice(tierIndex, 0, { name: 'Nueva Fila', characters: [], color: '#ffffff' });
            saveTierlistState();
            renderTierList();
        };

        document.getElementById('add-row-below').onclick = () => {
            tiers.splice(tierIndex + 1, 0, { name: 'Nueva Fila', characters: [], color: '#ffffff' });
            saveTierlistState();
            renderTierList();
        };

        document.getElementById('delete-row').onclick = () => {
            if (tiers.length > 1) {
                tiers.splice(tierIndex, 1);
                saveTierlistState();
                renderTierList();
                settingsWindow.style.display = 'none';
                settingsOverlay.style.display = 'none';
            } else {
                alert('No puedes eliminar la última fila.');
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

    sortOrderSelect?.addEventListener('change', (event) => {
        currentSortMode = event.target.value;
        renderTierList();
    });

    resetButton?.addEventListener('click', () => {
        tiers = defaultTiers.map(name => ({ name, characters: [], color: '#ffffff' }));
        unassignedCharacters = [...baseCharacters];
        selectedCharacters = [];
        saveTierlistState();
        renderTierList();
    });

    addTierRowButton?.addEventListener('click', () => {
        tiers.push({ name: 'Nueva Fila', characters: [], color: '#ffffff' });
        saveTierlistState();
        renderTierList();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            selectedCharacters = [];
            renderTierList();
        }
    });

    renderTierList();
});
