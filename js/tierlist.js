document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const tierListContainer = document.getElementById('tierlist-container');
    const addTierButton = document.getElementById('add-tier');
    const unassignedCharactersContainer = document.getElementById('unassigned-characters');

    if (!selectedCategory || !selectedCategory.characters) {
        alert('No hay personajes en la categoría.');
        return;
    }

    document.getElementById('selected-category').innerText = `${selectedCategory.name}`;

    const defaultTiers = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const tiers = defaultTiers.map(name => ({ name, characters: [] }));
    let unassignedCharacters = [...selectedCategory.characters];

    const renderTierList = () => {
        tierListContainer.innerHTML = '';
        unassignedCharactersContainer.innerHTML = '';

        tiers.forEach((tier, index) => {
            const tierRow = document.createElement('div');
            tierRow.classList.add('tier-row');
            
            const tierNameDiv = document.createElement('div');
            tierNameDiv.classList.add('tier-name');
            tierNameDiv.contentEditable = true;
            tierNameDiv.innerText = tier.name;

            const tierDropzone = document.createElement('div');
            tierDropzone.classList.add('tier-dropzone');
            tierDropzone.dataset.index = index;
            
            tier.characters.forEach(character => {
                const charDiv = document.createElement('div');
                charDiv.classList.add('character');
                charDiv.innerHTML = `<img src="${character.img}" alt="${character.name}"><p>${character.name}</p>`;
                tierDropzone.appendChild(charDiv);
            });

            const tierContainer = document.createElement('div');
            tierContainer.classList.add('tier-container');
            tierContainer.appendChild(tierNameDiv);
            tierContainer.appendChild(tierDropzone);
            tierListContainer.appendChild(tierContainer);
        });

        unassignedCharacters.forEach(character => {
            const charDiv = document.createElement('div');
            charDiv.classList.add('character');
            charDiv.draggable = true;
            charDiv.innerHTML = `<img src="${character.img}" alt="${character.name}"><p>${character.name}</p>`;

            charDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(character));
                e.dataTransfer.effectAllowed = 'move';
            });

            unassignedCharactersContainer.appendChild(charDiv);
        });

        document.querySelectorAll('.tier-dropzone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const character = JSON.parse(e.dataTransfer.getData('text/plain'));
                const tierIndex = e.target.dataset.index;
                
                if (!tiers[tierIndex].characters.some(c => c.name === character.name)) {
                    tiers[tierIndex].characters.push(character);
                    unassignedCharacters = unassignedCharacters.filter(c => c.name !== character.name);
                    renderTierList();
                }
            });
        });
    };

    addTierButton.addEventListener('click', () => {
        const tierName = prompt("Nombre de la nueva categoría:");
        if (tierName) {
            tiers.push({ name: tierName, characters: [] });
            renderTierList();
        }
    });

    renderTierList();
});
