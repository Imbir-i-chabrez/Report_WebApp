// script.js - Логика главной страницы

let cards = [];

document.addEventListener('DOMContentLoaded', function() {
    
    if (typeof cardsData !== 'undefined') {
        cards = [...cardsData];
    } else {
        console.error('Массив cardsData не найден!');
        cards = [];
    }
    
    let currentInnerTab = 'all-cards';
    let currentSection = '1';
    
    const allCardsContainer = document.getElementById('allCardsContainer');
    const openCardsContainer = document.getElementById('openCardsContainer');
    const closedCardsContainer = document.getElementById('closedCardsContainer');
    const todayCardsContainer = document.getElementById('todayCardsContainer');
    const weekCardsContainer = document.getElementById('weekCardsContainer');
    const monthCardsContainer = document.getElementById('monthCardsContainer'); 
    const cardTemplate = document.getElementById('card-template');

    const globalSearchBtn = document.getElementById('globalSearchBtn');
    if (globalSearchBtn) {
        globalSearchBtn.addEventListener('click', function() {
            window.location.href = 'search.html';
        });
    }
    
    const mainTabButtons = document.querySelectorAll('.main-tabs .tab-button');
    const mainTabContents = document.querySelectorAll('.tab-content');
    
    mainTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            mainTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            mainTabContents.forEach(content => content.classList.remove('active-tab'));
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active-tab');
                const contentArea = document.querySelector('.content');
                if (contentArea) contentArea.scrollTop = 0;
                if (tabId === 'tab1') {
                    currentSection = '1';
                    renderAllCards();
                    activateFirstInnerTab('1');
                } else if (tabId === 'tab2') {
                    currentSection = '2';
                    renderAllFilteredCards();
                    activateFirstInnerTab('2');
                }
            }
        });
    });
    
    const innerTabButtons = document.querySelectorAll('.inner-tab-button');
    const innerTabContents = document.querySelectorAll('.inner-tab-content');
    
    function activateFirstInnerTab(sectionNumber) {
        document.querySelectorAll(`.inner-tab-button[data-section="${sectionNumber}"]`).forEach(btn => {
            btn.classList.remove('active');
        });
        const firstButton = document.querySelector(`.inner-tab-button[data-section="${sectionNumber}"]`);
        if (firstButton) firstButton.classList.add('active');
        document.querySelectorAll(`.inner-tab-content[data-section="${sectionNumber}"]`).forEach(content => {
            content.classList.remove('active-inner-tab');
        });
        if (sectionNumber === '1') {
            const firstTabId = 'all-cards';
            const firstContent = document.getElementById(firstTabId);
            if (firstContent) {
                firstContent.classList.add('active-inner-tab');
                currentInnerTab = 'all-cards';
            }
        } else if (sectionNumber === '2') {
            const firstTabId = 'today-cards';
            const firstContent = document.getElementById(firstTabId);
            if (firstContent) {
                firstContent.classList.add('active-inner-tab');
            }
        }
    }
    
    innerTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const innerTabId = this.getAttribute('data-inner-tab');
            const sectionNumber = this.getAttribute('data-section');
            if (sectionNumber === '1') {
                currentInnerTab = innerTabId;
            }
            document.querySelectorAll(`.inner-tab-button[data-section="${sectionNumber}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll(`.inner-tab-content[data-section="${sectionNumber}"]`).forEach(content => {
                content.classList.remove('active-inner-tab');
            });
            const activeInnerContent = document.getElementById(innerTabId);
            if (activeInnerContent) {
                activeInnerContent.classList.add('active-inner-tab');
                if (sectionNumber === '1') {
                    if (innerTabId === 'all-cards') {
                        renderCardsInContainer(allCardsContainer, cards);
                    } else if (innerTabId === 'open-cards') {
                        renderCardsInContainer(openCardsContainer, cards.filter(c => c.status === 'open'));
                    } else if (innerTabId === 'closed-cards') {
                        renderCardsInContainer(closedCardsContainer, cards.filter(c => c.status === 'closed'));
                    }
                }
                const contentArea = document.querySelector('.content');
                if (contentArea) contentArea.scrollTop = 0;
            }
        });
    });
    
    function createCardElement(cardData) {
        const template = cardTemplate.content.cloneNode(true);
        const card = template.querySelector('.card');
        card.dataset.cardId = cardData.id;
        card.dataset.status = cardData.status;
        
        const title = card.querySelector('.card-title');
        title.textContent = cardData.title;
        
        const dateValue = card.querySelector('.date-value');
        dateValue.textContent = cardData.createdAt;
        
        const characteristicsContainer = card.querySelector('.card-characteristics');
        cardData.characteristics.forEach(char => {
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
            characteristicsContainer.appendChild(charItem);
        });
        
        const actionsContainer = card.querySelector('.card-actions');
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-btn btn-delete';
        deleteBtn.innerHTML = 'Удалить';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Удалить?')) {
                deleteCard(cardData.id);
            }
        });
        actionsContainer.appendChild(deleteBtn);
        
        if (cardData.status === 'open') {
            const statusBtn = document.createElement('button');
            statusBtn.className = 'card-btn btn-status';
            statusBtn.innerHTML = 'Закрыть';
            statusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCardStatus(cardData.id);
            });
            actionsContainer.appendChild(statusBtn);
        }
        return card;
    }
    
    function renderCardsInContainer(container, cardsToRender) {
        if (!container) return;
        container.innerHTML = '';
        if (cardsToRender.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'placeholder-message';
            emptyMessage.textContent = 'Нет событий';
            container.appendChild(emptyMessage);
            return;
        }
        cardsToRender.forEach(cardData => {
            const cardElement = createCardElement(cardData);
            container.appendChild(cardElement);
        });
    }

    function deleteCard(cardId) {
        cards = cards.filter(c => c.id !== cardId);
        renderAllCards();
        renderAllFilteredCards();
        if (currentInnerTab === 'open-cards') {
            renderCardsInContainer(openCardsContainer, cards.filter(c => c.status === 'open'));
        } else if (currentInnerTab === 'closed-cards') {
            renderCardsInContainer(closedCardsContainer, cards.filter(c => c.status === 'closed'));
        }
    }
    
    function toggleCardStatus(cardId) {
        const cardIndex = cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            cards[cardIndex].status = cards[cardIndex].status === 'open' ? 'closed' : 'open';
        }
        renderAllCards();
        renderAllFilteredCards();
        renderCardsInContainer(openCardsContainer, cards.filter(c => c.status === 'open'));
        renderCardsInContainer(closedCardsContainer, cards.filter(c => c.status === 'closed'));
    }
    
    function renderAllCards() {
        renderCardsInContainer(allCardsContainer, cards);
        renderCardsInContainer(openCardsContainer, cards.filter(c => c.status === 'open'));
        renderCardsInContainer(closedCardsContainer, cards.filter(c => c.status === 'closed'));
    }
    
    function parseDate(dateString) {
        if (!dateString) return new Date(0);
        const parts = dateString.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return new Date(dateString);
    }
    
    function isToday(dateString) {
        const today = new Date();
        const date = parseDate(dateString);
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
    }
    
    function isThisWeek(dateString) {
        const today = new Date();
        const date = parseDate(dateString);
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return date >= weekAgo && date <= today;
    }
    
    function isThisMonth(dateString) {
        const today = new Date();
        const date = parseDate(dateString);
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        return date >= monthAgo && date <= today;
    }
    
    function filterCardsByPeriod(period) {
        switch(period) {
            case 'today':
                return cards.filter(card => isToday(card.createdAt));
            case 'week':
                return cards.filter(card => isThisWeek(card.createdAt));
            case 'month':
                return cards.filter(card => isThisMonth(card.createdAt));
            default:
                return [];
        }
    }
    
    function renderFilteredCardsInContainer(container, period) {
        if (!container) return;
        const filteredCards = filterCardsByPeriod(period);
        renderCardsInContainer(container, filteredCards);
    }
    
    function renderAllFilteredCards() {
        renderFilteredCardsInContainer(todayCardsContainer, 'today');
        renderFilteredCardsInContainer(weekCardsContainer, 'week');
        renderFilteredCardsInContainer(monthCardsContainer, 'month');
    }
    
    function init() {
        renderAllCards();
        renderAllFilteredCards();
        activateFirstInnerTab('1');
    }
    
    init();
});