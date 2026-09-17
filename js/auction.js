document.addEventListener('DOMContentLoaded', () => {
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    const auctionSetup = document.getElementById('auction-setup');
    const auctionBoard = document.getElementById('auction-board');
    const setupWarning = document.getElementById('setup-warning');

    const playersCountInput = document.getElementById('players-count');
    const initialBudgetInput = document.getElementById('initial-budget');
    const orderModeSelect = document.getElementById('order-mode');
    const auctionTypeSelect = document.getElementById('auction-type');
    const itemsPerTeamInput = document.getElementById('items-per-team');
    const minIncrementInput = document.getElementById('min-increment');
    const showRivalsSelect = document.getElementById('show-rivals');
    const teamLimitModeSelect = document.getElementById('team-limit-mode');
    const turnModeSelect = document.getElementById('turn-mode');
    const startButton = document.getElementById('start-auction');
    const resetButton = document.getElementById('reset-auction');

    const itemImage = document.getElementById('item-image');
    const itemName = document.getElementById('item-name');
    const itemPosition = document.getElementById('item-position');
    const highestBidText = document.getElementById('highest-bid');
    const highestPlayerText = document.getElementById('highest-player');
    const auctionNote = document.getElementById('auction-note');
    const playersPanel = document.getElementById('players-panel');
    const bidHistoryList = document.getElementById('bid-history');
    const auctionSummary = document.getElementById('auction-summary');

    let items = [];
    let players = [];
    let currentItemIndex = -1;
    let currentItem = null;
    let currentBid = 0;
    let currentLeader = null;
    let passed = [];
    let bidHistory = [];
    let totalBids = 0;
    let highestBidValue = 0;
    let lowestPurchase = null;
    let itemsPerTeam = 1;
    let turnIndex = 0;
    let turnOrderStart = null;
    let openingPlayerIndex = null;
    let teamLimitMode = 'stop';
    let turnMode = 'free';

    if (!selectedCategory || !selectedCategory.characters || !selectedCategory.characters.length) {
        alert('Seleccione una categoría con elementos antes de iniciar la subasta.');
        window.location.href = 'mode.html';
        return;
    }

    items = [...selectedCategory.characters];

    function showWarning(message) {
        setupWarning.textContent = message;
        setupWarning.classList.remove('hidden');
    }

    function hideWarning() {
        setupWarning.classList.add('hidden');
    }

    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function resetAuctionState() {
        currentItemIndex = -1;
        currentItem = null;
        currentBid = 0;
        currentLeader = null;
        passed = [];
        bidHistory = [];
        totalBids = 0;
        highestBidValue = 0;
        lowestPurchase = null;
        turnIndex = 0;
        turnOrderStart = null;
        openingPlayerIndex = null;
    }

    function createPlayers(count, budget) {
        return Array.from({ length: count }, (_, index) => ({
            name: `Jugador ${index + 1}`,
            budget,
            acquired: [],
            spent: 0,
            active: true
        }));
    }

    function playerCanBid(playerIndex) {
        const player = players[playerIndex];
        const minOffer = currentBid + parseInt(minIncrementInput.value, 10);
        return player && player.active && player.budget >= minOffer
            && (teamLimitMode === 'continue' || player.acquired.length < itemsPerTeam)
            && currentLeader !== playerIndex;
    }

    function setNextTurn() {
        if (turnMode !== 'turns') return;
        for (let offset = 1; offset <= players.length; offset += 1) {
            const nextIndex = (turnIndex + offset) % players.length;
            if (!passed[nextIndex] && playerCanBid(nextIndex)) {
                turnIndex = nextIndex;
                return;
            }
        }
    }

    function hasEligibleBidder(excludedIndex = null) {
        return players.some((_, index) => index !== excludedIndex
            && !passed[index]
            && playerCanBid(index));
    }

    function setNextOpeningPlayer() {
        if (turnMode !== 'turns') return true;
        if (turnOrderStart === null) {
            turnIndex = 0;
            openingPlayerIndex = null;
            return hasEligibleBidder();
        }

        const previousOpening = openingPlayerIndex === null ? turnOrderStart : openingPlayerIndex;
        for (let offset = 1; offset <= players.length; offset += 1) {
            const nextIndex = (previousOpening + offset) % players.length;
            if (playerCanBid(nextIndex)) {
                turnIndex = nextIndex;
                openingPlayerIndex = nextIndex;
                return true;
            }
        }
        return false;
    }

    function buildPlayersPanel() {
        playersPanel.innerHTML = '';
        const showRivals = showRivalsSelect.value === 'true';

        players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            if (player.active) {
                card.classList.add('active');
            }

            const playerName = document.createElement('h3');
            playerName.textContent = player.name;
            const budgetText = document.createElement('p');
            budgetText.textContent = showRivals || index === 0
                ? `Dinero: ${player.budget} monedas`
                : `Dinero: ${player.budget === 0 ? 0 : '???'}`;
            const spentText = document.createElement('p');
            spentText.textContent = `Gastado: ${player.spent} monedas`;
            const teamText = document.createElement('p');
            teamText.textContent = `Equipo: ${player.acquired.length}/${itemsPerTeam}`;
            const acquiredList = document.createElement('div');
            acquiredList.className = 'acquired-list';
            player.acquired.forEach(item => {
                const acquiredItem = document.createElement('div');
                acquiredItem.className = 'acquired-item';
                const image = document.createElement('img');
                image.src = item.img || '';
                image.alt = item.name || 'Elemento';
                const name = document.createElement('span');
                name.textContent = `${item.name} (${item.price})`;
                acquiredItem.appendChild(image);
                acquiredItem.appendChild(name);
                acquiredList.appendChild(acquiredItem);
            });
            const statusText = document.createElement('p');
            statusText.textContent = passed[index] ? 'Ha pasado' : 'En subasta';

            const actions = document.createElement('div');
            actions.className = 'player-actions';

            const minOffer = currentBid + parseInt(minIncrementInput.value, 10);
            const bidInput = document.createElement('input');
            bidInput.type = 'number';
            bidInput.className = 'bid-input';
            bidInput.min = minOffer;
            bidInput.value = Math.min(minOffer, player.budget);
            bidInput.placeholder = `Mín ${minOffer}`;
            const openingTurnIsFree = turnMode === 'turns'
                && currentBid === 0
                && currentLeader === null
                && turnOrderStart === null;
            const isTurn = turnMode !== 'turns' || openingTurnIsFree || turnIndex === index;
            bidInput.disabled = !isTurn || !playerCanBid(index);

            const bidButton = document.createElement('button');
            bidButton.textContent = 'Pujar';
            bidButton.disabled = !isTurn || !playerCanBid(index);
            bidButton.addEventListener('click', () => handleBid(index, parseInt(bidInput.value, 10)));

            const passButton = document.createElement('button');
            passButton.textContent = 'Pasar';
            const mustOpen = turnMode === 'turns'
                && currentBid === 0
                && currentLeader === null
                && turnOrderStart !== null
                && turnIndex === index;
            passButton.disabled = passed[index] || !player.active || !isTurn || mustOpen;
            passButton.addEventListener('click', () => handlePass(index));

            actions.appendChild(bidInput);
            actions.appendChild(bidButton);
            actions.appendChild(passButton);

            card.appendChild(playerName);
            card.appendChild(budgetText);
            card.appendChild(spentText);
            card.appendChild(teamText);
            card.appendChild(statusText);
            card.appendChild(acquiredList);
            card.appendChild(actions);
            playersPanel.appendChild(card);
        });
    }

    function updateAuctionDisplay() {
        if (!currentItem) return;

        itemImage.src = currentItem.img || '';
        itemImage.alt = currentItem.name || 'Elemento';
        itemName.textContent = currentItem.name || 'Sin nombre';
        itemPosition.textContent = `${currentItemIndex + 1} de ${items.length}`;
        highestBidText.textContent = currentBid;
        highestPlayerText.textContent = currentLeader !== null ? players[currentLeader].name : 'Nadie';
        auctionNote.textContent = turnMode === 'turns'
            ? turnOrderStart === null
                ? 'Primera puja libre: quien puje primero establece el orden de turnos.'
                : `Turno de ${players[turnIndex].name}. Debe iniciar con una puja.`
            : 'Subasta abierta. Elige pujar o pasar.';
        buildPlayersPanel();
    }

    function recordBid(playerIndex, amount) {
        const isFirstBid = turnMode === 'turns' && turnOrderStart === null;
        if (isFirstBid) {
            turnOrderStart = playerIndex;
            turnIndex = playerIndex;
            openingPlayerIndex = playerIndex;
        }
        currentBid = amount;
        currentLeader = playerIndex;
        passed = passed.map((value, index) => index === playerIndex ? false : value);
        const message = `${players[playerIndex].name} puja ${amount} monedas.`;
        bidHistory.unshift(message);
        totalBids += 1;
        highestBidValue = Math.max(highestBidValue, amount);
        setNextTurn();
        renderHistory();
        updateAuctionDisplay();
        checkAuctionEnd();
    }

    function renderHistory() {
        if (!bidHistoryList) return;
        bidHistoryList.innerHTML = '';
        bidHistory.slice(0, 30).forEach(entry => {
            const li = document.createElement('li');
            li.textContent = entry;
            bidHistoryList.appendChild(li);
        });
    }

    function handleBid(playerIndex, bidValue) {
        const minOffer = currentBid + parseInt(minIncrementInput.value, 10);
        const player = players[playerIndex];
        const openingTurnIsFree = turnMode === 'turns'
            && currentBid === 0
            && currentLeader === null
            && turnOrderStart === null;

        if (!playerCanBid(playerIndex) || (turnMode === 'turns' && !openingTurnIsFree && turnIndex !== playerIndex)) {
            showWarning(turnMode === 'turns' ? `Es el turno de ${players[turnIndex].name}.` : 'Este jugador no puede sobrepujarse a sí mismo o ya completó su equipo.');
            return;
        }

        if (player.budget < minOffer) {
            showWarning('No tiene presupuesto suficiente para pujar más alto.');
            return;
        }

        if (Number.isNaN(bidValue)) {
            showWarning('Ingrese un valor válido para la puja.');
            return;
        }

        if (bidValue < minOffer) {
            showWarning(`La puja debe ser al menos ${minOffer} monedas.`);
            return;
        }

        if (bidValue > player.budget) {
            showWarning('No puedes pujar más de tu presupuesto.');
            return;
        }

        hideWarning();
        recordBid(playerIndex, bidValue);
    }

    function handlePass(playerIndex) {
        const openingTurnIsFree = turnMode === 'turns'
            && currentBid === 0
            && currentLeader === null
            && turnOrderStart === null;
        if (turnMode === 'turns' && !openingTurnIsFree && turnIndex !== playerIndex) return;
        if (turnMode === 'turns' && turnOrderStart !== null && currentBid === 0 && currentLeader === null) {
            showWarning('El jugador que inicia debe hacer una puja.');
            return;
        }
        passed[playerIndex] = true;
        bidHistory.unshift(`${players[playerIndex].name} ha pasado.`);
        renderHistory();
        buildPlayersPanel();
        setNextTurn();
        checkAuctionEnd();
    }

    function checkAuctionEnd() {
        const activePlayers = players.filter((_, index) => !passed[index]);
        if (activePlayers.length === 0) {
            if (currentLeader === null && auctionTypeSelect.value === 'all') {
                bidHistory.unshift('Todos han pasado; se pasa al siguiente personaje.');
                renderHistory();
                currentItemIndex += 1;
                if (currentItemIndex >= items.length) {
                    endAuction();
                } else {
                    currentItem = items[currentItemIndex];
                    currentBid = 0;
                    currentLeader = null;
                    passed = players.map(() => false);
                    if (!setNextOpeningPlayer()) {
                        finalizeAuction();
                        return;
                    }
                    buildPlayersPanel();
                    updateAuctionDisplay();
                }
            } else if (currentLeader === null && auctionTypeSelect.value === 'limited') {
                if (!hasEligibleBidder()) {
                    endAuction();
                    return;
                }
                bidHistory.unshift('Todos han pasado; vuelve a intentarlo con el mismo personaje.');
                passed = players.map(() => false);
                turnIndex = openingPlayerIndex === null ? 0 : openingPlayerIndex;
                renderHistory();
                buildPlayersPanel();
                updateAuctionDisplay();
            } else {
                finalizeAuction();
            }
            return;
        }

        if (currentLeader !== null && !hasEligibleBidder(currentLeader)) {
            finalizeAuction();
        }
    }

    function finalizeAuction() {
        if (currentLeader !== null && currentBid > 0) {
            const winner = players[currentLeader];
            winner.budget -= currentBid;
            winner.spent += currentBid;
            winner.acquired.push({ ...currentItem, price: currentBid });
            bidHistory.unshift(`${winner.name} gana ${currentItem.name} por ${currentBid} monedas.`);
            lowestPurchase = lowestPurchase === null ? currentBid : Math.min(lowestPurchase, currentBid);
        } else {
            bidHistory.unshift(`Nadie gana ${currentItem.name}.`);
        }

        renderHistory();
        currentItem = null;
        currentBid = 0;
        currentLeader = null;
        passed = players.map(() => false);

        const remaining = items.filter((_, index) => index > currentItemIndex);
        if (remaining.length === 0 || auctionTypeSelect.value === 'limited' && players.every(player => player.acquired.length >= itemsPerTeam)) {
            endAuction();
        } else {
            openNextItem();
        }
    }

    function openNextItem() {
        currentItemIndex += 1;
        if (currentItemIndex >= items.length) {
            endAuction();
            return;
        }
        currentItem = items[currentItemIndex];
        currentBid = 0;
        currentLeader = null;
        passed = players.map(() => false);
        if (!setNextOpeningPlayer()) {
            finalizeAuction();
            return;
        }
        buildPlayersPanel();
        renderHistory();
        updateAuctionDisplay();
    }

    function endAuction() {
        auctionNote.textContent = 'Subasta finalizada.';
        buildFinalSummary();
        auctionBoard.querySelector('.auction-main').classList.add('hidden');
        auctionSummary.classList.remove('hidden');
    }

    function buildFinalSummary() {
        auctionSummary.innerHTML = '<h2>Resumen final de equipos</h2>';
        const summaryGrid = document.createElement('div');
        summaryGrid.className = 'summary-grid';
        players.forEach(player => {
            const card = document.createElement('article');
            card.className = 'player-summary';
            card.innerHTML = `<h3>${player.name}</h3><p>Gastado: ${player.spent} monedas</p><p>Saldo: ${player.budget} monedas</p>`;
            const team = document.createElement('div');
            team.className = 'summary-team';
            player.acquired.forEach(item => {
                const figure = document.createElement('figure');
                const image = document.createElement('img');
                image.src = item.img || '';
                image.alt = item.name || 'Elemento';
                const caption = document.createElement('figcaption');
                caption.textContent = `${item.name} · ${item.price}`;
                figure.appendChild(image);
                figure.appendChild(caption);
                team.appendChild(figure);
            });
            card.appendChild(team);
            summaryGrid.appendChild(card);
        });
        auctionSummary.appendChild(summaryGrid);
    }

    function startAuction() {
        hideWarning();
        const playersCount = parseInt(playersCountInput.value, 10);
        const initialBudget = parseInt(initialBudgetInput.value, 10);
        itemsPerTeam = parseInt(itemsPerTeamInput.value, 10);
        const minIncrement = parseInt(minIncrementInput.value, 10);
        const auctionType = auctionTypeSelect.value;
        teamLimitMode = teamLimitModeSelect.value;
        turnMode = turnModeSelect.value;

        if (!playersCount || playersCount < 2) {
            showWarning('Ingrese al menos 2 jugadores.');
            return;
        }
        if (!initialBudget || initialBudget < 10) {
            showWarning('Presupuesto inicial mínimo 10.');
            return;
        }
        if (!itemsPerTeam || itemsPerTeam < 1) {
            showWarning('Ingrese al menos 1 personaje por equipo.');
            return;
        }
        if (!minIncrement || minIncrement < 1) {
            showWarning('El incremento mínimo debe ser al menos 1 moneda.');
            return;
        }

        players = createPlayers(playersCount, initialBudget);
        resetAuctionState();

        const availableItems = [...selectedCategory.characters];
        if (auctionType === 'limited') {
            const requiredItems = playersCount * itemsPerTeam;
            if (availableItems.length < requiredItems) {
                showWarning(`No hay suficientes elementos para ${requiredItems} personajes.`);
                return;
            }
            items = availableItems.slice(0, requiredItems);
        } else {
            items = availableItems;
        }

        if (orderModeSelect.value === 'random') {
            items = shuffle(items);
        }

        auctionSetup.classList.add('hidden');
        auctionBoard.classList.remove('hidden');
        auctionBoard.querySelector('.auction-main').classList.remove('hidden');
        auctionSummary.classList.add('hidden');
        buildPlayersPanel();
        bidHistory = [];
        renderHistory();
        openNextItem();
    }

    startButton.addEventListener('click', startAuction);
    resetButton.addEventListener('click', () => {
        auctionSetup.classList.remove('hidden');
        auctionBoard.classList.add('hidden');
        resetAuctionState();
        auctionNote.textContent = '';
    });
});
