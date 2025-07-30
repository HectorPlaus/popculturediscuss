document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('roulette-list');
    const scrollUpButton = document.getElementById('scroll-up');
    const scrollDownButton = document.getElementById('scroll-down');
    const randomCategoryButton = document.getElementById('random-category');
    const rouletteContainer = document.getElementById('roulette-container');
  
    let currentOffset = 0;
    const itemHeight = 100;
    const maxVisible = 3;
  
  
  
    // Mostrar todas las categorías
    function displayCategories(categoriesToDisplay) {
      categoryList.innerHTML = '';
      categoriesToDisplay.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.name;
        li.addEventListener('click', () => selectCategory(category));
        categoryList.appendChild(li);
      });
      currentOffset = 0;
      updateTransform();
    }
  
    function updateTransform() {
      categoryList.style.transform = `translateY(${-currentOffset * itemHeight}px)`;
    }
  
    function scrollByStep(direction) {
      const maxOffset = categories.length - maxVisible;
      if (direction === 1 && currentOffset < maxOffset) {
        currentOffset++;
      } else if (direction === -1 && currentOffset > 0) {
        currentOffset--;
      }
      updateTransform();
    }
  
    scrollUpButton.addEventListener('click', () => scrollByStep(-1));
    scrollDownButton.addEventListener('click', () => scrollByStep(1));
  
    // Scroll con ratón
    rouletteContainer.addEventListener('wheel', (event) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      scrollByStep(direction);
    }, { passive: false });
  
    // Swipe táctil
    let touchStartY = 0;
    let touchEndY = 0;
  
    rouletteContainer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
  
    rouletteContainer.addEventListener('touchmove', (e) => {
      touchEndY = e.touches[0].clientY;
    }, { passive: true });
  
    rouletteContainer.addEventListener('touchend', () => {
      const delta = touchStartY - touchEndY;
      if (Math.abs(delta) > 30) {
        const direction = delta > 0 ? 1 : -1;
        scrollByStep(direction);
      }
    });
  
    // Selección aleatoria con animación
    function spinRoulette(categories, callback) {
      const spinItems = [...Array(60)].flatMap(() => categories.map(c => ({ ...c })));
      categoryList.innerHTML = '';
      spinItems.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.name;
        li.addEventListener('click', () => selectCategory(category));
        categoryList.appendChild(li);
      });
  
       
      let position = 0;
      const speed = 20;
      const step = 50; 
      const totalSteps = 100;
      let currentStep = 0;
  
      const interval = setInterval(() => {
        position -= step;
        categoryList.style.transform = `translateY(${position}px)`;
        currentStep++;
  
        if (currentStep > totalSteps) {
          clearInterval(interval);
          const visibleIndex = Math.floor(Math.random() * categories.length);
          const selectedCategory = spinItems[visibleIndex % spinItems.length];
         
          setTimeout(() => {
            displayCategories(categories);
            callback(selectedCategory);
          }, 500);
        }
      }, speed);
    }
  
    randomCategoryButton.addEventListener('click', () => {
      spinRoulette(categories, selectCategory);
    });
  
    function selectCategory(category) {
      localStorage.setItem('selectedCategory', JSON.stringify(category));
  
      const modal = document.getElementById('age-warning-modal');
      const confirmButton = document.getElementById('confirm-age');
      const closeButton = document.getElementById('close-modal');
  
      if (category.name === "+18") {
        if (modal) {
          modal.style.display = "block";
  
          confirmButton.onclick = () => {
            modal.style.display = "none";
            continueNavigation();
          };
  
          closeButton.onclick = () => {
            modal.style.display = "none";
          };
  
          window.onclick = function (event) {
            if (event.target === modal) {
              modal.style.display = "none";
            }
          };
  
          return;
        }
      }
  
      continueNavigation();
    }
  
    function continueNavigation() {
      const categoryScreen = document.getElementById('category-screen');
      if (categoryScreen) {
        categoryScreen.classList.add('hidden');
      }
  
      const modeScreen = document.getElementById('mode-screen');
      if (modeScreen) {
        modeScreen.classList.remove('hidden');
      }
  
      window.location.href = 'mode.html';
    }
  
    // Inicializar
    categories.sort((a, b) => a.name.localeCompare(b.name));
    displayCategories(categories);
  });
  