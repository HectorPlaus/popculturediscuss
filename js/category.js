document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.getElementById('category-list');
  const categorySearch = document.getElementById('category-search');
  const randomCategoryButton = document.getElementById('random-category'); // Botón para categoría aleatoria

  // Verifica si estamos en la página correcta antes de ejecutar lógica
  if (categoryList && categorySearch && randomCategoryButton) {
    initCategoryLogic();
  }

  function displayCategories(categoriesToDisplay) {
    categoryList.innerHTML = '';

    const totalCategories = categoriesToDisplay.length;
    const columns = Math.ceil(Math.sqrt(totalCategories));
    const rows = Math.ceil(totalCategories / columns);
    categoryList.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    categoryList.style.gridTemplateRows = `repeat(${rows}, auto)`;

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

    // Ahora, redirigir correctamente a la página de "Mode"
    window.location.href = 'pages/mode.html';  // Aquí estamos asegurándonos de que se redirige correctamente
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
