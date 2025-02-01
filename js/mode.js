document.addEventListener('DOMContentLoaded', () => {
     // Recuperar la categoría seleccionada desde localStorage
     const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
     if (selectedCategory) {
         const categoryName = document.getElementById('category-name');
         categoryName.textContent = `${selectedCategory.name}`;
     }
  
    // Evento para el botón de "Draft"
    const draftButton = document.getElementById('draft-mode');
    draftButton.addEventListener('click', () => {
        window.location.href = 'draft.html'; 
    });
  
    // Evento para el botón de "Team Fight"
    const teamFightButton = document.getElementById('teamfight-mode');
    if (teamFightButton) {
      teamFightButton.addEventListener('click', () => {
        window.location.href = 'teamfight.html';
      });
    }
  
    // Evento para el botón de "Mystery Top"
    const mysteryTopButton = document.getElementById('mysterytop-mode');
    if (mysteryTopButton) {
      mysteryTopButton.addEventListener('click', () => {
        window.location.href = 'mysterytop.html';
      });
    }

    // Evento para el botón de "Fuck Marry Kill" 
    const fuckmarrykillButton = document.getElementById('fuckmarrykill-mode');
    if (fuckmarrykillButton) {
      fuckmarrykillButton.addEventListener('click', () => {
        window.location.href = 'fumaki.html';
      });
    }
  
    // Evento para el botón de "Otro modo"
    const otherModeButton = document.getElementById('other-mode');
    otherModeButton.addEventListener('click', () => {
      alert('Proximamente...');
    });
  });
  