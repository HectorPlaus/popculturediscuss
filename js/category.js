document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.getElementById('category-list');
  const categorySearch = document.getElementById('category-search');
  const randomCategoryButton = document.getElementById('random-category'); 
  const rouletteModeButton = document.getElementById('roulette-mode-button');

  // Verifica si estamos en la página correcta antes de ejecutar lógica
  if (categoryList && categorySearch && randomCategoryButton) {
    initCategoryLogic();
  }

  // Manejar el botón de atrás del navegador
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.type === 'subcategories') {
      const group = event.state.group;
      localStorage.setItem('selectedGroup', JSON.stringify(group));
      displayCategories(group.subcategories, true);
    } else {
      localStorage.removeItem('selectedGroup');
      displayCategories(categories);
    }
  });

  function displayCategories(categoriesToDisplay, isSubcategory = false) {
    categoryList.innerHTML = '';
    if (isSubcategory) {
      categoryList.classList.add('subcategory-list');
    } else {
      categoryList.classList.remove('subcategory-list');
    }

    const totalCategories = categoriesToDisplay.length;
    const columns = Math.ceil(Math.sqrt(totalCategories));
  


    categoriesToDisplay.forEach(category => {
      const li = document.createElement('li');
      if (category.img) {
        const img = document.createElement('img');
        img.src = category.img;
        img.alt = category.name;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '5px';
        li.appendChild(img);
      } else {
        li.textContent = category.name;
      }
      li.addEventListener('click', () => selectCategory(category));
      categoryList.appendChild(li);
    });
  }

  function selectCategory(category) {
    if (category.subcategories) {
      // Es un grupo, mostrar subcategorías
      localStorage.setItem('selectedGroup', JSON.stringify(category));
      history.pushState({type: 'subcategories', group: category}, '', '');
      displayCategories(category.subcategories, true);
      return;
    }

    // Guardar la categoría seleccionada para usarla en el modo de juego y el draft
    localStorage.setItem('selectedCategory', JSON.stringify(category));

    // Obtener elementos del modal
    const modal = document.getElementById('age-warning-modal');
    const confirmButton = document.getElementById('confirm-age');
    const closeButton = document.getElementById('close-modal');

    if (category.name === "+18") {
        if (modal) {
            modal.style.display = "block";

            // Si el usuario acepta, cerrar el modal y continuar
            confirmButton.onclick = function () {
                modal.style.display = "none";
                continueNavigation();
            };

            // Permitir cerrar el modal sin continuar
            closeButton.onclick = function () {
                modal.style.display = "none";
            };

            // Cerrar el modal si se hace clic fuera de él
            window.onclick = function (event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            };

            return; // Evita que se ejecute el resto del código antes de confirmar
        }
    }

    // Continuar con la navegación normal si no es categoría +18
    continueNavigation();
}

function continueNavigation() {
    // Ocultar la pantalla de categorías
    const categoryScreen = document.getElementById('category-screen');
    if (categoryScreen) {
        categoryScreen.classList.add('hidden');
    }

    // Mostrar la pantalla de modo de juego
    const modeScreen = document.getElementById('mode-screen');
    if (modeScreen) {
        modeScreen.classList.remove('hidden');
    }

    // Redirigir a la página de modo de juego
    window.location.href = 'pages/mode.html';
}



  function initCategoryLogic() {
    localStorage.removeItem('selectedGroup');
    // Ordena las categorías alfabéticamente
    categories.sort((a, b) => a.name.localeCompare(b.name));

    displayCategories(categories); // Muestra todas las categorías en la lista

    categorySearch.addEventListener('input', () => {
      const searchTerm = categorySearch.value.toLowerCase();
      const currentCategories = localStorage.getItem('selectedGroup') ? JSON.parse(localStorage.getItem('selectedGroup')).subcategories : categories;
      const filteredCategories = currentCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm)
      );
      displayCategories(filteredCategories, !!localStorage.getItem('selectedGroup'));
    });

    randomCategoryButton.addEventListener('click', () => {
      const currentCategories = localStorage.getItem('selectedGroup') ? JSON.parse(localStorage.getItem('selectedGroup')).subcategories : categories;
      const randomCategory = currentCategories[Math.floor(Math.random() * currentCategories.length)];
      selectCategory(randomCategory);
    });
    rouletteModeButton.addEventListener('click', () => {
      window.location.href = 'pages/roulette.html'; // Redirige a la página de la ruleta
    });
    
  }
});
