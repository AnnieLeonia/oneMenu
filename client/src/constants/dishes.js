export const FETCH_DISH = "FETCH_DISH";
export const RESET_DISH = "RESET_DISH";
export const FETCH_DISHES = "FETCH_DISHES";

export const DEFAULT_DESCRIPTION = (dish) => `# ${dish.name}
Svårighetsgrad   | Tid
---------------- | -------------
Svår/Medel/Enkel | 15/30/45 min

En kort beskrivning av rätten.

## Ingredienser
Mängd | Ingrediens
----- | ----------
500 g | Kärlek
500 g | Glädje
1 st  | Humor
1/2 st | Tålamod
&nbsp; | salt
&nbsp; | peppar

## Tillagning
1. Dela kärleken.
2. Blanda glädje och humor.
3. Tillsätt tålamod.
4. Salta och peppra efter smak.
`;
