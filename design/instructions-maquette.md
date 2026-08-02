# Instructions de maquettage — {{Nom de l'application}}
> Document à destination de **{{IDE avec LLM}}** pour la conception des maquettes (wireframes haute-fidélité) de l'application web {{Nom de l'application}}
>
> Référence CDC : {{Référence CDC}}
> Charte graphique : voir `design.md`

---

## 1. Contexte et objectif du projet

{{Nom du client}} est {{description du client — secteur, activité}}. L'application {{Nom de l'application}} a pour but de **{{objectif principal — ex. remplacer tel processus papier/Excel par une solution web}}**.

**Enjeux principaux à retranscrire dans les maquettes :**
- {{Enjeu 1 — ex. interface pensée pour un usage spécifique}}
- {{Enjeu 2 — ex. densité d'information / lisibilité}}
- {{Enjeu 3 — ex. feedback métier immédiat}}
- {{Enjeu 4 — ex. navigation guidée / séquentielle}}
- {{Enjeu 5 — ex. traçabilité des actions}}

---

## 2. Périmètre des écrans à maquetter

### Priorité 1 — Écrans indispensables (V1)

| ID | Écran | Profil principal |
|---|---|---|
| E01 | {{Écran}} | {{Profil}} |
| E02 | {{Écran}} | {{Profil}} |
| E03 | {{Écran}} | {{Profil}} |
| E04 | {{Écran}} | {{Profil}} |
| E05 | {{Écran}} | {{Profil}} |

### Priorité 2 — Écrans secondaires (V1)

| ID | Écran | Profil principal |
|---|---|---|
| E06 | {{Écran}} | {{Profil}} |
| E07 | {{Écran}} | {{Profil}} |

### Optionnel (V2, non prioritaire)

| ID | Écran |
|---|---|
| E08 | {{Écran}} |
| E09 | {{Écran}} |

---

## 3. Structure et navigation globale

### Layout général

```
┌───────────────────────────────────────────────────────────────┐
│  HEADER FIXE                                                   │
│  [Logo {{Client}}]  [Contexte en cours]  [Profil utilisateur] │
├────────────┬──────────────────────────────────────────────────┤
│  SIDEBAR   │                                                   │
│            │  ZONE PRINCIPALE                                  │
│  Navigation│                                                   │
│  principale│  Contenu contextuel                              │
│            │                                                   │
│  {{px}} px │                                                   │
└────────────┴──────────────────────────────────────────────────┘
```

### Sidebar — Navigation principale

La sidebar affiche uniquement les rubriques accessibles selon le profil connecté :

- **{{Rubrique 1}}**
- **{{Rubrique 2}}** ({{profil(s) concerné(s)}} uniquement)
- **{{Rubrique 3}}** ({{profil(s) concerné(s)}} uniquement)
- **Administration** (Administrateur uniquement)

{{Description d'un éventuel indicateur contextuel persistant en sidebar}}

---

## 4. Détail des écrans à maquetter

---

### E01 — {{Nom de l'écran}}

**Objectif :** {{Description courte de l'objectif de cet écran}}

**Éléments :**
- {{Élément 1}}
- {{Élément 2}}
- {{Élément 3}}

**Contraintes :** {{Contraintes spécifiques à cet écran}}

---

### E02 — {{Nom de l'écran}}

**Objectif :** {{Description courte}}

**Éléments :**
- {{Élément 1}}
- {{Élément 2}}
- {{Élément 3}}

**Statuts affichés** : {{Statut 1}} | {{Statut 2}} | {{Statut 3}}

---

### E03 — {{Nom de l'écran}}

**Objectif :** {{Description courte}}

**Éléments :**
- {{Élément 1 — ex. barre de recherche}}
- {{Élément 2 — ex. filtres}}
- {{Élément 3 — ex. tableau paginé}}

---

### E04 — {{Nom de l'écran}}

**Objectif :** {{Description courte}}

{{Description du layout si complexe — ex. deux colonnes, onglets, sidebar contextuelle}}

**Éléments :**
- {{Élément 1}}
- {{Élément 2}}
- {{Élément 3}}

---

### E05 — {{Nom de l'écran}}

**Objectif :** {{Description courte}}

**Contexte :** {{Depuis où est-il accessible, quel profil}}

**Éléments :**
- {{Élément 1}}
- {{Élément 2}}

---

## 5. Règles UX transversales

### {{Règle UX 1 — ex. Navigation séquentielle et blocages}}

{{Description de la règle et de sa matérialisation visuelle attendue}}

### {{Règle UX 2 — ex. Traçabilité}}

{{Description de la règle}}
- {{Règle détaillée 1}}
- {{Règle détaillée 2}}

### {{Règle UX 3 — ex. Feedback en temps réel}}

- {{Règle détaillée 1}}
- {{Règle détaillée 2}}

### États des formulaires

Prévoir systématiquement les états suivants pour chaque composant interactif :
- Vide / Au repos
- Focus actif
- Valeur saisie (valide)
- Valeur saisie (invalide / erreur)
- Lecture seule
- Chargement (skeleton loader)

---

## 6. Modèle de données à illustrer

### Hiérarchie des données

```
{{Entité racine}}
└── {{Entité niveau 1}}
    └── {{Entité niveau 2}}
        └── {{Entité niveau 3}}
            └── {{Entité feuille}}
```

### {{Règles métier importantes pour les maquettes}}

| {{Cas}} | {{Valeur / Comportement}} |
|---|---|
| {{Cas 1}} | {{Valeur}} |
| {{Cas 2}} | {{Valeur}} |
| {{Cas 3}} | {{Valeur}} |

---

## 7. Données fictives pour les maquettes

**{{Entité principale}} exemple :**
- {{Champ 1}} : {{Valeur fictive}}
- {{Champ 2}} : {{Valeur fictive}}
- {{Champ 3}} : {{Valeur fictive}}

**Utilisateurs fictifs :**
- {{Prénom NOM}} — {{Profil}}
- {{Prénom NOM}} — {{Profil}}
- {{Prénom NOM}} — {{Profil}}

---

## 8. Points ouverts à signaler dans les maquettes

Les points suivants sont **en suspens**. Les maquettes peuvent les matérialiser avec des états "À définir" ou des placeholders :

- **P01** — {{Point ouvert 1}}
- **P02** — {{Point ouvert 2}}
- **P03** — {{Point ouvert 3}}

---

## 9. Livrables attendus de {{Prestataire design}}

1. **Wireframes haute-fidélité** des {{N}} écrans prioritaires
2. **Design system** documenté (composants, états, tokens de couleur) conforme à `design.md`
3. **Prototype interactif** couvrant a minima le parcours principal : {{Description du parcours principal}}
4. **Annotations UX** sur les interactions complexes
5. **Spécifications responsive** : {{résolution(s) cible(s)}}

---

## 10. Contraintes techniques

| Contrainte | Valeur |
|---|---|
| Navigateurs cibles | {{ex. Chrome, Brave — versions récentes}} |
| Résolution minimum | {{ex. 1280 × 768}} |
| Résolution optimale | {{ex. 1920 × 1080}} |
| Temps de chargement cible | {{ex. < 3 secondes}} |
| Utilisateurs simultanés | {{ex. 50 minimum}} |
| Formats d'export | {{ex. PDF, CSV}} |
| Authentification | {{ex. Login / Mot de passe — pas de SSO en V1}} |
| Accessibilité | {{ex. WCAG AA minimum}} |
| Mode dark | {{Oui / Non requis}} |
| Mobile / tablette | {{Oui / Non requis en V1}} |
