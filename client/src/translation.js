/* eslint-disable */

module.exports = {
  nav: {
    dishes: ["Dishes", "Varor", "Platos"],
    menu: ["Menu", "Meny", "Menú"],
    categories: ["Categories", "Kategorier", "Categorías"],
    find: ["Find", "Hitta", "Buscar"],
  },
  find: {
    title: [
      "Find something to cook",
      "Hitta något att laga",
      "Encuentra algo para cocinar",
    ],
    subtitle: [
      "Select ingredients you have:",
      "Välj ingredienser du har:",
      "Selecciona los ingredientes que tienes:",
    ],
    search: [
      "Search ingredients...",
      "Sök ingredienser...",
      "Buscar ingredientes...",
    ],
    selected: ["Selected", "Valda", "Seleccionados"],
    clearAll: ["Clear all", "Rensa alla", "Borrar todo"],
    hint: [
      "Pick ingredients above to see matching recipes.",
      "Välj ingredienser ovan för att se matchande recept.",
      "Elige ingredientes arriba para ver recetas coincidentes.",
    ],
    noIngredients: [
      "No ingredients found in your recipes yet. Add a YAML ingredients list in the recipe description.",
      "Inga ingredienser hittades i dina recept än. Lägg till en YAML-ingredienslista i receptbeskrivningen.",
      "Aún no se encontraron ingredientes en tus recetas. Añade ingredientes estructurados o una tabla de Ingredients.",
    ],
    noMatches: [
      "No recipes match those ingredients.",
      "Inga recept matchar de ingredienserna.",
      "Ninguna receta coincide con esos ingredientes.",
    ],
    results: ["Matching recipes", "Matchande recept", "Recetas coincidentes"],
    matchCount: [
      "${ matched }/${ total } ingredients",
      "${ matched }/${ total } ingredienser",
      "${ matched }/${ total } ingredientes",
    ],
    missing: [
      "Missing: ${ names }",
      "Saknas: ${ names }",
      "Faltan: ${ names }",
    ],
    categories: {
      meat: ["Meat and poultry", "Kött och fågel", "Carne y aves"],
      fish: ["Fish and seafood", "Fisk och skaldjur", "Pescado y mariscos"],
      vegetables: ["Vegetables", "Grönsaker", "Verduras"],
      fruits: ["Fruits", "Frukt", "Frutas"],
      dairy: ["Dairy", "Mejeri", "Lácteos"],
      pantry: ["Pantry", "Skafferi", "Despensa"],
      other: ["Other", "Övrigt", "Otros"],
    },
  },
  edit: {
    edit: ["Edit", "Redigera", "Editar"],
    name: ["Name", "Namn", "Nombre"],
    img: ["Image URL", "Bild-url", "URL de imagen"],
    description: ["Description", "Beskrivning", "Descripción"],
    category: ["Category", "Kategori", "Categoría"],
    day: ["Day", "Dag", "Día"],
    color: ["Color", "Färg", "Color"],
    selectColor: [
      "Select a color...",
      "Välj färg...",
      "Selecciona un color...",
    ],
    cancel: ["Cancel", "Avbryt", "Cancelar"],
    save: ["Save", "Spara", "Guardar"],
    delete: ["Delete", "Radera", "Eliminar"],
  },
  menu: {
    noDay: ["No day", "Ingen dag", "Sin día"],
    week: ["Week", "Vecka", "Semana"],
    prevWeek: ["Prev", "Förra", "Anterior"],
    nextWeek: ["Next", "Nästa", "Siguiente"],
    currentWeek: ["Current week", "Nuvarande vecka", "Semana actual"],
    showAll: ["Show all dishes", "Visa alla rätter", "Mostrar todos"],
    showWeek: ["Show weekly menu", "Visa veckans meny", "Mostrar menú semanal"],
  },
  categories: {
    input: ["New category...", "Ny kategori...", "Nueva categoría..."],
    uncategorized: ["Uncategorized", "Okategoriserad", "Sin categoría"],
    nonexistent: [
      "Category does not exist",
      "Kategorin finns inte",
      "La categoría no existe",
    ],
  },
  dishes: {
    cart: ["Cart", "Varukorg", "Carrito"],
    remove: ["Done", "Klar", "Listo"],
    input: ["New dish...", "Ny vara...", "Nuevo plato..."],
    back: ["Back", "Tillbaka", "Atrás"],
  },
  settings: {
    title: ["Settings", "Inställningar", "Configuración"],
    authenticated: [
      "Here you can configure your account.",
      "Här kan du konfigurera ditt konto.",
      "Aquí puedes configurar tu cuenta.",
    ],
    unauthenticated: [
      "Please log in to see your settings.",
      "Vänligen logga in för att se dina inställningar.",
      "Por favor inicia sesión para ver tu configuración.",
    ],
    language: ["Language: ", "Språk: ", "Idioma: "],
  },
  user: {
    login: ["Log In", "Logga in", "Iniciar sesión"],
    logout: ["Logout", "Logga ut", "Cerrar sesión"],
    name: ["Name: ", "Namn: ", "Nombre: "],
    email: ["Email: ", "Mail: ", "Correo: "],
    language: ["Lang: ", "Språk: ", "Idioma: "],
    submit: ["Save", "Spara", "Guardar"],
  },
  snackbar: {
    unauthenticated: [
      "You are not logged in. Please log in and try again.",
      "Du är inte inloggad. Logga in och försök igen.",
      "No has iniciado sesión. Por favor, inicia sesión e inténtalo de nuevo.",
    ],
  },
};
