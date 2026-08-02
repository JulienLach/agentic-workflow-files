 # Brand Guide — {{Client}}
> À destination de {{IDE avec LLM}} pour la conception de la maquette de l'application web {{Nom de l'application}}

---

## 1. Identité de la marque

**Nom complet :** {{Nom complet du client}}
**Secteur :** {{Secteur d'activité}}
**Positionnement :** {{Positionnement, valeurs clés}}
**Tone of voice :** {{Ton éditorial — ex. sobre, professionnel, dynamique, accessible...}}

---

## 2. Logo

**Fichier :** `{{nom-du-logo.png}}`

{{Description du logo — formes, typographie, couleurs, particularités visuelles.}}

### Règles d'usage du logo

- {{Règle 1 — ex. utiliser sur fond clair uniquement}}
- {{Règle 2 — ex. ne pas déformer}}
- {{Règle 3 — zone de protection}}
- Version recommandée pour l'interface : {{position, hauteur max}}

---

## 3. Palette de couleurs

### Couleurs primaires

| Rôle | Nom | Code Hex | Usage |
|---|---|---|---|
| {{Rôle}} | {{Nom}} | `#000000` | {{Usage}} |
| {{Rôle}} | {{Nom}} | `#000000` | {{Usage}} |
| {{Rôle}} | {{Nom}} | `#000000` | {{Usage}} |

### Couleurs secondaires

| Rôle | Nom | Code Hex | Usage |
|---|---|---|---|
| {{Rôle}} | {{Nom}} | `#000000` | {{Usage}} |
| {{Rôle}} | {{Nom}} | `#000000` | {{Usage}} |
| {{Rôle}} | {{Nom}} | `#000000` | {{Usage}} |

### Couleurs fonctionnelles (UI)

| Rôle | Code Hex | Usage |
|---|---|---|
| Succès | `#000000` | {{Usage}} |
| Erreur | `#000000` | {{Usage}} |
| Avertissement | `#000000` | {{Usage}} |
| Info | `#000000` | {{Usage}} |

> **Règle d'or :** {{Contrainte d'usage des couleurs fonctionnelles — ex. le vert et le rouge sont réservés au feedback métier.}}

---

## 4. Typographie

{{Contexte d'usage — ex. lisibilité sur grands écrans, usage atelier, grand public...}}

### Police recommandée

**{{Famille typographique}}** — {{Description et justification du choix}}

Fallback : `{{font-stack CSS}}`

### Hiérarchie typographique

| Niveau | Taille | Graisse | Usage |
|---|---|---|---|
| H1 — Titre de section | px | {{weight}} | {{Usage}} |
| H2 — Titre de bloc | px | {{weight}} | {{Usage}} |
| H3 — Sous-titre | px | {{weight}} | {{Usage}} |
| Body — Texte courant | px | {{weight}} | {{Usage}} |
| Small — Texte secondaire | px | {{weight}} | {{Usage}} |
| Label — Libellés | px | {{weight}} | {{Usage}} |

---

## 5. Iconographie

- Style : {{Outlined / Filled / Duotone...}}
- Bibliothèque recommandée : {{Lucide / Phosphor / Heroicons...}}
- Taille standard : {{px inline}}, {{px boutons}}, {{px titres}}
- Couleur : {{règle de couleur — hérite du parent, couleur fixe...}}

Icônes fonctionnelles clés à prévoir :
- `{{icon-name}}` — {{Usage}}
- `{{icon-name}}` — {{Usage}}
- `{{icon-name}}` — {{Usage}}

---

## 6. Style visuel général

### Esprit

{{Description de l'esprit visuel global — épuré, moderne, industriel, chaleureux...}}

### Rayon de bordure (border-radius)

| Composant | Valeur |
|---|---|
| Boutons | px |
| Cartes / Panneaux | px |
| Champs de saisie | px |
| Badges / Tags | px |
| Modales | px |

### Ombres

```
Card shadow: {{valeur CSS}}
Modal shadow: {{valeur CSS}}
```

### Fond de page

{{Couleur de fond — hex + justification}}

---

## 7. Composants UI — Conventions

### Boutons

| Type | Style |
|---|---|
| Primaire | {{Description}} |
| Secondaire | {{Description}} |
| Danger | {{Description}} |
| Fantôme | {{Description}} |
| Désactivé | {{Description}} |

Taille minimale des zones cliquables : **{{px}} × {{px}} px**

### Champs de saisie

- Bordure au repos : `{{hex}}`
- Bordure focus : `{{hex}}`
- Fond : {{couleur}}
- Erreur : {{description}}

### Tableaux

- En-tête : {{style}}
- Ligne impaire : {{fond}}
- Ligne paire : {{fond}}
- Hauteur de ligne minimale : {{px}} px

### Badges de statut

| Statut | Fond | Texte |
|---|---|---|
| {{Statut}} | `{{hex}}` | `{{hex}}` |
| {{Statut}} | `{{hex}}` | `{{hex}}` |
| {{Statut}} | `{{hex}}` | `{{hex}}` |

---

## 8. Navigation et mise en page

### Structure globale recommandée

```
{{Schéma ASCII ou description de la layout}}
```

- **Header** : {{description — hauteur, fond, contenu gauche/droite}}
- **Sidebar** : {{description — largeur, fond, style de navigation}}
- **Zone principale** : {{description — fond, padding}}

### Densité d'information

{{Contexte d'usage des écrans et niveau de densité souhaité}}

---

## 9. Accessibilité

- Contraste minimum : ratio 4.5:1 pour le texte courant (WCAG AA)
- {{Combinaison couleur/fond}} donne un ratio de **X:1** ✓
- {{Combinaison couleur/fond}} donne un ratio de **X:1** ✓
- Taille de cible minimale : {{px}} px

---

## 10. À ne pas faire

- {{Interdit 1}}
- {{Interdit 2}}
- {{Interdit 3}}
- {{Interdit 4}}
