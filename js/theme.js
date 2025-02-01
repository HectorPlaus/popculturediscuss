
const toggleButton = document.getElementById("toggle-theme");
const icon = toggleButton.querySelector("i");
const body = document.body;

// Cargar el tema desde localStorage al cargar la página
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-theme");
  icon.classList.replace("fa-moon", "fa-sun"); // Cambiar a sol
}

// Alternar entre modo oscuro y claro
toggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-theme");

  // Cambiar el icono del botón según el tema
  const isDark = body.classList.contains("dark-theme");
  icon.classList.replace(isDark ? "fa-moon" : "fa-sun", isDark ? "fa-sun" : "fa-moon");

  // Guardar la preferencia en localStorage
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
