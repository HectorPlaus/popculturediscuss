document.addEventListener('DOMContentLoaded', () => {
    // Configura los botones de navegación
    const homeLink = document.getElementById('home-link');
    if (homeLink) homeLink.addEventListener('click', showHome);
    
    const modeLink = document.getElementById('mode-link');
    if (modeLink) modeLink.addEventListener('click', showMode);
    
    const draftLink = document.getElementById('draft-link');
    if (draftLink) draftLink.addEventListener('click', showDraftSetup);
    
    const resultsLink = document.getElementById('results-link');
    if (resultsLink) resultsLink.addEventListener('click', showResults);
  
    // Inicializa las lógicas de cada sección
    // initDraftLogic(); // Not needed in index.html
    // initResultsLogic(); // Not needed in index.html
  
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
    const home = document.getElementById('home');
    if (home) home.classList.add('hidden');
    
    const modeScreen = document.getElementById('mode-screen');
    if (modeScreen) modeScreen.classList.add('hidden');
    
    const draftSetup = document.getElementById('draft-setup');
    if (draftSetup) draftSetup.classList.add('hidden');
    
    const results = document.getElementById('results');
    if (results) results.classList.add('hidden');
  }
  