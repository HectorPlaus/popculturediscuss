
const toggleButton = document.getElementById("toggle-theme");

if (toggleButton) {
  const icon = toggleButton.querySelector("i");
  const body = document.body;

  const applyTheme = (isDark) => {
    body.classList.toggle("dark-theme", isDark);

    if (icon) {
      icon.classList.remove("fa-moon", "fa-sun");
      icon.classList.add(isDark ? "fa-sun" : "fa-moon");
    }

    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  // Cargar el tema desde localStorage al cargar la página
  if (localStorage.getItem("theme") === "dark") {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  // Alternar entre modo oscuro y claro
  toggleButton.addEventListener("click", () => {
    const isDark = body.classList.contains("dark-theme");
    applyTheme(!isDark);
  });
}
