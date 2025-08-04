document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('roulette-list');
    const scrollUpButton = document.getElementById('scroll-up');
    const scrollDownButton = document.getElementById('scroll-down');
    const randomCategoryButton = document.getElementById('random-category');
    const rouletteContainer = document.getElementById('roulette-container');
  
    let currentOffset = 0;
    const itemHeight = 100;
    const maxVisible = 5;
  
  
  
    // Mostrar todas las categorías
    function displayCategories(categoriesToDisplay) {
      categoryList.innerHTML = '';
    
      // Crear 3 copias de la lista para simular infinito real
      const repeated = [...categoriesToDisplay, ...categoriesToDisplay, ...categoriesToDisplay];
    
      repeated.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.name;
        li.addEventListener('click', () => selectCategory(category));
        categoryList.appendChild(li);
      });
    
      currentOffset = categoriesToDisplay.length; // empezamos en la copia central
      updateTransform();
    }
  
    function updateTransform() {
      categoryList.style.transform = `translateY(${-currentOffset * itemHeight}px)`;
    }
  
    
function scrollByStep(direction) {
  const totalItems = categories.length;
  currentOffset += direction;

  // Cuando llegamos al extremo, saltamos a la copia central para que no se note
  if (currentOffset < totalItems) {
    currentOffset += totalItems;
  } else if (currentOffset >= totalItems * 2) {
    currentOffset -= totalItems;
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
      const totalItems = categories.length;
      const visibleIndex = Math.floor(Math.random() * totalItems);
    
      const extraRounds = 2; // menos vueltas → más rápido
      const totalSteps = extraRounds * totalItems + visibleIndex;
    
      let currentStep = 0;
      let speed = 40; // más rápido
      const startIndex = currentOffset;
    
      function stepRoulette() {
        scrollByStep(1); // siempre hacia abajo
        currentStep++;
    
        // Frenado progresivo en los últimos 8 pasos
        if (currentStep > totalSteps - 8) {
          speed += 25;
        }
    
        if (currentStep < totalSteps) {
          setTimeout(stepRoulette, speed);
        } else {
          // Centramos la categoría final
          const centerIndex = Math.floor(maxVisible / 2);
          currentOffset = startIndex + visibleIndex - centerIndex;
          updateTransform();
    
          // Pausa antes de entrar
          setTimeout(() => {
            callback(categories[visibleIndex]);
          }, 1500);
        }
      }
    
      stepRoulette();
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
  