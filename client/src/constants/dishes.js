export const FETCH_DISH = "FETCH_DISH";
export const RESET_DISH = "RESET_DISH";
export const FETCH_DISHES = "FETCH_DISHES";

export const DEFAULT_DESCRIPTION = (dish) => `---
title: ${dish.name}
difficulty: Enkel/Medel/Svår
time: 15/30/45 min
servings: 4
description: En kort beskrivning av rätten.
ingredients:
  - name: Kärlek
    quantity: 500
    unit: g
  - name: Glädje
    quantity: 500
    unit: g
  - name: Humor
    quantity: 1
    unit: st
  - name: Tålamod
    quantity: 1/2
    unit: st
  - name: salt
  - name: peppar
steps:
  - Dela **kärleken**.
  - Blanda *glädje* och humor.
  - Tillsätt tålamod.
  - Salta och peppra efter smak.
---
`;
