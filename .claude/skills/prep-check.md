---
name: prep-check
description: Vérifie qu'une préparation de tâche complexe est complète avant d'entrer en mode plan. Utiliser juste avant de lancer un plan (après /prep ou une préparation manuelle), pour éviter un plan qui saute la doc, les edge cases, la sécurité ou la prod.
---

Vérifie, avant d'entrer en mode plan, que chacun des points suivants a été réellement traité pour : $ARGUMENTS

Réponds point par point, par oui/non + preuve concrète (ce qui a été fait), jamais par supposition :

- [ ] **Doc** : la doc des libs et le code existant pertinent ont été consultés — pas juste supposés connus
- [ ] **Remise en question** : les hypothèses ambiguës ont été confirmées avec l'utilisateur, pas devinées
- [ ] **Réflexion complète** : le problème a été réfléchi étape par étape jusqu'au bout, pas arrêté à la première solution qui marche
- [ ] **Prod / edge cases / limits** : explicitement considérés, pas seulement le chemin heureux
- [ ] **Sécurité** : auth, IDOR, injection, exposition de données — considérés si applicable
- [ ] **Réversibilité** : si ça touche des données, le rollback est identifié

## Verdict

- **Tout est coché** → passe en mode plan.
- **Au moins un point manque** → ne passe pas en plan. Retourne traiter le(s) point(s) manquant(s) (`/prep` si besoin), puis relance cette vérification.

Ne jamais cocher un point par défaut ou parce qu'il « semble évident » — un point non explicitement vérifié compte comme non traité.
