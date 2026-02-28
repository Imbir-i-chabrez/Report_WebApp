// search.js - логика страницы поиска

document.addEventListener('DOMContentLoaded', function() {
    
    let allCards = typeof cardsData !== 'undefined' ? [...cardsData] : [];
    
    const backButton = document.getElementById('backButton');
    const searchInput = document.getElementById('globalSearchInput');
    const clearButton = document.getElementById('globalSearchClear');
    const resultsCountSpan = document.getElementById('globalResultsCount');
    const resultsContainer = document.getElementById('searchResults');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    function createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'result-card';
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.status = card.status;
        
        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = `<h3 class="card-title">${escapeHtml(card.title)}</h3>`;

        const dateDiv = document.createElement('div');
        dateDiv.className = 'card-date';
        dateDiv.innerHTML = `
            <span class="date-label">Дата:</span>
            <span class="date-value">${escapeHtml(card.createdAt)}</span>
        `;
        
        const charsContainer = document.createElement('div');
        charsContainer.className = 'card-characteristics';
        
        card.characteristics.forEach(char => {
            const charItem = document.createElement('div');
            charItem.className = 'characteristic-item';
            
            const charName = document.createElement('div');
            charName.className = 'characteristic-name';
            charName.textContent = char.name;
            
            const charValue = document.createElement('div');
            charValue.className = 'characteristic-value';
            charValue.textContent = char.value;
            
            if (char.value.length > 100) {
                charValue.classList.add('characteristic-value-long');
            }
            
            charItem.appendChild(charName);
            charItem.appendChild(charValue);
            charsContainer.appendChild(charItem);
        });
        
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-btn btn-delete';
        deleteBtn.innerHTML = 'Удалить';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Удалить?')) {
                deleteCard(card.id);
            }
        });
        actions.appendChild(deleteBtn);
        
        if (card.status === 'open') {
            const statusBtn = document.createElement('button');
            statusBtn.className = 'card-btn btn-status';
            statusBtn.innerHTML = 'Закрыть';
            statusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCardStatus(card.id);
            });
            actions.appendChild(statusBtn);
        }
        
        cardDiv.appendChild(header);
        cardDiv.appendChild(dateDiv);
        cardDiv.appendChild(charsContainer);
        cardDiv.appendChild(actions);
        
        return cardDiv;
    }
    
    function searchCards(term) {
        if (!term) return allCards;
        
        term = term.toLowerCase();
        return allCards.filter(card => {
            const characteristicsText = card.characteristics
                .map(c => `${c.name} ${c.value}`)
                .join(' ');
            
            const searchText = `
                ${card.title} 
                ${characteristicsText}
                ${card.status}
                ${card.createdAt}
            `.toLowerCase();
            
            return searchText.includes(term);
        });
    }
    
    function performSearch() {
        if (!resultsContainer) return;
        
        const searchTerm = searchInput.value.trim();
        const filteredCards = searchCards(searchTerm);
        
        resultsContainer.innerHTML = '';
        
        if (filteredCards.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        } else {
            filteredCards.forEach(card => {
                resultsContainer.appendChild(createCardElement(card));
            });
        }
        
        if (resultsCountSpan) {
            resultsCountSpan.textContent = filteredCards.length;
        }
        
        if (clearButton) {
            clearButton.classList.toggle('visible', searchTerm !== '');
        }
    }
    
    function deleteCard(cardId) {
        allCards = allCards.filter(c => c.id !== cardId);
        performSearch();
    }
    
    function toggleCardStatus(cardId) {
        const cardIndex = allCards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            allCards[cardIndex].status = allCards[cardIndex].status === 'open' ? 'closed' : 'open';
            performSearch();
        }
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') this.blur();
        });
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            performSearch();
            searchInput.focus();
        });
    }
    
    function init() {
        performSearch();
    }
    
    init();
});