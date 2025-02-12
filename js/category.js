document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.getElementById('category-list');
  const categorySearch = document.getElementById('category-search');
  const randomCategoryButton = document.getElementById('random-category'); 

  // Verifica si estamos en la página correcta antes de ejecutar lógica
  if (categoryList && categorySearch && randomCategoryButton) {
    initCategoryLogic();
  }

  function displayCategories(categoriesToDisplay) {
    categoryList.innerHTML = '';

    const totalCategories = categoriesToDisplay.length;
    const columns = Math.ceil(Math.sqrt(totalCategories));
  


    categoriesToDisplay.forEach(category => {
      const li = document.createElement('li');
      li.textContent = category.name;
      li.addEventListener('click', () => selectCategory(category));
      categoryList.appendChild(li);
    });
  }

  function selectCategory(category) {
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
    // Ordena las categorías alfabéticamente
    categories.sort((a, b) => a.name.localeCompare(b.name));

    displayCategories(categories); // Muestra todas las categorías en la lista

    categorySearch.addEventListener('input', () => {
      const searchTerm = categorySearch.value.toLowerCase();
      const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm)
      );
      displayCategories(filteredCategories);
    });

    randomCategoryButton.addEventListener('click', () => {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      selectCategory(randomCategory);
    });
  }
});
