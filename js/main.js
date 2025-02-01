document.addEventListener('DOMContentLoaded', () => {
    // Configura los botones de navegación
    document.getElementById('home-link').addEventListener('click', showHome);
    document.getElementById('mode-link').addEventListener('click', showMode);
    document.getElementById('draft-link').addEventListener('click', showDraftSetup);
    document.getElementById('results-link').addEventListener('click', showResults);
  
    // Inicializa las lógicas de cada sección
    initCategoryLogic();
    initDraftLogic();
    initResultsLogic();
  
    // Configura la navegación inicial
    showHome();
  });
  
  // Función para mostrar la pantalla de inicio
  function showHome() {
    hideAllSections();
    document.getElementById('home').classList.remove('hidden');
  }
  
  // Función para mostrar la pantalla de modo de juego
  function showMode() {
    hideAllSections();
    document.getElementById('mode-screen').classList.remove('hidden');
  }
  
  // Función para mostrar la configuración del draft
  function showDraftSetup() {
    hideAllSections();
    document.getElementById('draft-setup').classList.remove('hidden');
  }
  
  // Función para mostrar los resultados
  function showResults() {
    hideAllSections();
    document.getElementById('results').classList.remove('hidden');
  }
  
  // Oculta todas las secciones
  function hideAllSections() {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('mode-screen').classList.add('hidden');
    document.getElementById('draft-setup').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
  }
  