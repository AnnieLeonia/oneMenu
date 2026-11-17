/* eslint-disable */

/** Strings only used by migration / verify UI — remove with this folder when done. */
module.exports = {
  settings: {
    migration: {
      link: ["Dish verify", "Verifiera rätter", "Verificar platos"],
      title: [
        "Compare dishes with verify files",
        "Jämför rätter med verify-filer",
        "Comparar platos con archivos verify",
      ],
      back: ["Settings", "Inställningar", "Configuración"],
      help: [
        "Compare production dish markdown with tmp/dish-verify on disk.",
        "Jämför produktionens markdown med tmp/dish-verify på disk.",
        "Compara el markdown de producción con tmp/dish-verify en disco.",
      ],
      selectDish: ["Dish", "Rätt", "Plato"],
      prev: ["Previous", "Föregående", "Anterior"],
      next: ["Next", "Nästa", "Siguiente"],
      selectPlaceholder: ["Choose a dish…", "Välj en rätt…", "Elige un plato…"],
      pickDish: [
        "Select a dish to compare.",
        "Välj en rätt för att jämföra.",
        "Elige un plato para comparar.",
      ],
      current: ["In production", "I produktion", "En producción"],
      verify: ["Verify file", "Verify-fil", "Archivo verify"],
      apply: ["Apply verify file", "Använd verify-fil", "Usar archivo verify"],
      applyHint: [
        "Replaces the dish description in the database with the verify file.",
        "Ersätter beskrivningen i databasen med verify-filen.",
        "Reemplaza la descripción en la base de datos con el archivo verify.",
      ],
      openEditor: ["Open in editor", "Öppna i editorn", "Abrir en el editor"],
      loadingVerify: [
        "Loading verify file…",
        "Laddar verify-fil…",
        "Cargando archivo verify…",
      ],
      noVerifyFile: [
        "No verify markdown file for this dish (tmp/dish-verify).",
        "Ingen verify-fil för den här rätten (tmp/dish-verify).",
        "No hay archivo verify para este plato (tmp/dish-verify).",
      ],
      matchesProduction: [
        "Matches production — nothing to apply.",
        "Matchar produktion — inget att tillämpa.",
        "Coincide con producción — nada que aplicar.",
      ],
    },
  },
};
