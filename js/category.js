// global array to hold loaded categories
let categories = [];

// cache of DOM elements (populated after DOMContentLoaded)
let categoryList, categorySearch, randomCategoryButton, rouletteModeButton;

// Mapeo de categorías a colores del Trivial Pursuit
const trivialColors = {
  'Geografía': 'trivial-geografia',
  'Entretenimiento': 'trivial-entretenimiento',
  'Historia': 'trivial-historia',
  'Arte y Literatura': 'trivial-arte',
  'Ciencias y Naturaleza': 'trivial-ciencia',
  'Deportes y Ocio': 'trivial-deportes',
};

// entry point: fetch the top‑level list and then initialize
async function loadCategories() {
  try {
    const response = await fetch('data/categories.json');
    categories = await response.json();
    // keep the array sorted by name for easier browsing
    categories.sort((a, b) => a.name.localeCompare(b.name));

    // cache DOM elements now that DOM is ready
    categoryList = document.getElementById('category-list');
    categorySearch = document.getElementById('category-search');
    randomCategoryButton = document.getElementById('random-category');
    rouletteModeButton = document.getElementById('roulette-mode-button');

    initCategoryLogic();

    // if we landed on a subcategory hash, preload the chain so display works immediately
    if (window.location.hash === '#subcategories') {
      const path = JSON.parse(localStorage.getItem('categoryPath') || '[]');
      if (path.length > 0) {
        await loadSubcategoriesForPath(path);
        const last = findCategoryByPath(path);
        if (last) displayCategories(last.subcategories, true);
      }
    }
  } catch (err) {
    console.error('Failed to load categories.json', err);
  }
}

document.addEventListener('DOMContentLoaded', loadCategories);

// Manejar el cambio de hash para subcategorías
window.addEventListener('hashchange', async () => {
  console.log('Hashchange event, hash:', window.location.hash);
  let pathNames = JSON.parse(localStorage.getItem('categoryPath') || '[]');
  if (window.location.hash === '#subcategories') {
    if (pathNames.length > 0) {
      const category = await findCategoryByPathAsync(pathNames);
      if (category) {
        displayCategories(category.subcategories, true);
      }
    }
  } else {
    if (pathNames.length > 1) {
      pathNames.pop();
      localStorage.setItem('categoryPath', JSON.stringify(pathNames));
      const category = findCategoryByPath(pathNames);
      if (category) {
        displayCategories(category.subcategories, true);
        window.location.hash = 'subcategories';
      }
    } else {
      localStorage.removeItem('categoryPath');
      displayCategories(categories);
    }
  }
});

// Manejar el botón de atrás del navegador (para otras páginas)
window.addEventListener('popstate', (event) => {
  console.log('Popstate event:', event.state);
  if (event.state && event.state.type === 'subcategories') {
    const groupName = event.state.groupName;
    localStorage.setItem('selectedGroup', groupName);
    const category = findCategoryByName(categories, groupName);
    if (category) {
      displayCategories(category.subcategories, true);
    }
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
      
      // Aplicar color del Trivial Pursuit si corresponde
      if (trivialColors[category.name]) {
        li.classList.add(trivialColors[category.name]);
      }
      
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


async function selectCategory(category) {
  // if the category points at an external file and hasn't been loaded yet, do it now
  if (category.file && !category.subcategories) {
    try {
      const resp = await fetch('data/' + category.file);
      category.subcategories = await resp.json();
    } catch (err) {
      console.error('Unable to load', category.file, err);
    }
  }

  if (category.subcategories) {
    // Es un grupo, mostrar subcategorías
    let pathNames = JSON.parse(localStorage.getItem('categoryPath') || '[]');
    pathNames.push(category.name);
    localStorage.setItem('categoryPath', JSON.stringify(pathNames));
    window.location.hash = 'subcategories';
    displayCategories(category.subcategories, true);
    return;
  }

    // Guardar solo el nombre de la categoría y reconstruir cuando se necesite
    localStorage.setItem('selectedCategoryName', category.name);
    localStorage.setItem('selectedCategory', JSON.stringify(category));

    // Obtener elementos del modal
    const modal = document.getElementById('age-warning-modal');
    const confirmButton = document.getElementById('confirm-age');
    const closeButton = document.getElementById('close-modal');

    if (category.name === "+18") {
        if (modal) {
            modal.style.display = "block";

            confirmButton.onclick = function () {
                modal.style.display = "none";
                continueNavigation();
            };

            closeButton.onclick = function () {
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
    const currentGroup = localStorage.getItem('selectedGroup');
    if (currentGroup) {
      history.pushState({type: 'subcategories', group: JSON.parse(currentGroup)}, '', window.location.href);
    }
    window.location.href = 'pages/mode.html';
}




  function initCategoryLogic() {
    console.log('initCategoryLogic called');
    // categories already sorted earlier

    displayCategories(categories); // Muestra todas las categorías en la lista

    // Si hay hash de subcategorías, mostrarlas
    if (window.location.hash === '#subcategories') {
      let path = JSON.parse(localStorage.getItem('categoryPath') || '[]');
      if (path.length > 0) {
        const last = findCategoryByPath(path);
        if (last && last.subcategories) {
          displayCategories(last.subcategories, true);
        }
      }
    }

    if (categorySearch) {
      categorySearch.addEventListener('input', () => {
        const searchTerm = categorySearch.value.toLowerCase();
        let pathNames = JSON.parse(localStorage.getItem('categoryPath') || '[]');
        const currentCategories = pathNames.length > 0 ? findCategoryByPath(pathNames).subcategories : categories;
        const filteredCategories = currentCategories.filter(category =>
          category.name.toLowerCase().includes(searchTerm)
        );
        displayCategories(filteredCategories, pathNames.length > 0);
      });
    }

    if (randomCategoryButton) {
      randomCategoryButton.addEventListener('click', () => {
        let pathNames = JSON.parse(localStorage.getItem('categoryPath') || '[]');
        const currentCategories = pathNames.length > 0 ? findCategoryByPath(pathNames).subcategories : categories;
        const randomCategory = currentCategories[Math.floor(Math.random() * currentCategories.length)];
        selectCategory(randomCategory);
      });
    }

    if (rouletteModeButton) {
      rouletteModeButton.addEventListener('click', () => {
        const currentGroup = localStorage.getItem('selectedGroup');
        if (currentGroup) {
          history.pushState({type: 'subcategories', groupName: currentGroup}, '', window.location.href);
        }
        window.location.href = 'pages/roulette.html';
      });
    }
    
  }

  // Función auxiliar para buscar una categoría por nombre
  function findCategoryByName(categoriesArray, name) {
    for (let cat of categoriesArray) {
      if (cat.name === name) return cat;
      if (cat.subcategories) {
        const found = findCategoryByName(cat.subcategories, name);
        if (found) return found;
      }
    }
    return null;
  }

  // Función auxiliar para buscar una categoría siguiendo una ruta de nombres
  function findCategoryByPath(pathNames) {
    let current = categories;
    let category = null;
    
    for (let name of pathNames) {
      category = current.find(cat => cat.name === name);
      if (!category) return null;
      current = category.subcategories || [];
    }
    
    return category;
  }

  // asynchronous version that will fetch missing subcategories along a path
  async function findCategoryByPathAsync(pathNames) {
    let current = categories;
    let category = null;
    for (let name of pathNames) {
      category = current.find(cat => cat.name === name);
      if (!category) return null;
      if (category.file && !category.subcategories) {
        try {
          const resp = await fetch('data/' + category.file);
          category.subcategories = await resp.json();
        } catch (err) {
          console.error('Failed to load', category.file, err);
        }
      }
      current = category.subcategories || [];
    }
    return category;
  }

  // helper used when the page loads with a saved path so we can prefetch
  async function loadSubcategoriesForPath(pathNames) {
    let current = categories;
    for (let name of pathNames) {
      const cat = current.find(c => c.name === name);
      if (!cat) break;
      if (cat.file && !cat.subcategories) {
        try {
          const r = await fetch('data/' + cat.file);
          cat.subcategories = await r.json();
        } catch (err) {
          console.warn('could not load', cat.file);
        }
      }
      current = cat.subcategories || [];
    }
  }

