---
name: veille-cve
description: Veille sécurité du jour - CVE et failles qui touchent MA stack (Node, nginx, Apache, PostgreSQL, Docker, paquets npm...) depuis les flux officiels à jour à l'heure près. Utiliser quand l'utilisateur lance /veille-cve [heures], demande les dernières CVE, les failles du jour ou si sa stack est touchée par une vulnérabilité.
---

# /veille-cve - failles de ma stack

Fenêtre : `$ARGUMENTS` en heures si fourni, sinon 48 h (la veille + le jour même). Date du jour : celle du contexte système.

## 1. Collecte CVE (une seule commande)

`node ~/.claude/skills/veille-cve/collect.ts <heures>`

Le script interroge directement CISA KEV, NVD, GitHub Advisories (npm) et CERT-FR, puis filtre sur `stack.txt`. Ne pas chercher de CVE par WebSearch : les moteurs ont des heures de retard sur ces flux. Une source `[!] en échec` se signale en une ligne, sans la remplacer.

## 2. Tri (le script filtre large, toi tu tranches)

Garder une CVE seulement si **le produit vulnérable est la techno elle-même** (nginx, Node.js core, serveur PostgreSQL, Docker Engine...) ou un paquet `npm:` listé. Un produit tiers qui tourne sur ou autour de la techno est rejeté (ex. "Postgres Enterprise Manager", "isomorphic-git ... for Node.js", "plugin X for Claude Code").

- Versions : lire les commentaires de `stack.txt` (ex. `postgres:14-alpine`) et dire dans `à faire :` si la version utilisée est touchée.
- CVE non scorée : juger sur la description (RCE, contournement d'auth, élévation de privilèges = gardée).
- Avis CERT-FR noyau Linux : une seule ligne, en ne citant que Fedora/Red Hat.
- Version corrigée absente de la sortie : un WebSearch ciblé sur l'advisory de l'éditeur, sinon `à faire : surveiller le correctif`.
- Ordre : exploitée (KEV) d'abord, puis par CVSS décroissant.

## 3. Sortie

Bloc de code texte brut, français avec accents, sans emoji ni tableau. Expliquer tout terme non évident à sa première occurrence (ex. "request smuggling (désynchroniser proxy et backend pour glisser une requête cachée)").

```
SÉCU STACK - [JJ mois AAAA] ([fenêtre] h)

- [!] [CVE] [techno] [score] ([date], [EXPLOITÉE] si KEV) -> [url]
  [1-2 phrases : vecteur d'attaque, qui est exposé concrètement.]
  à faire : [version corrigée / mitigation / "pas concerné si ..."]

Rien d'autre sur ta stack.   <- si la liste est vide, cette seule ligne
```

Maximum 8 items ; au-delà, regrouper par techno (`nginx : 6 CVE, toutes corrigées en 1.29.4`).

## Ajuster le périmètre

Éditer `~/.claude/skills/veille-cve/stack.txt` : une techno par ligne, `kev:` pour les technos à gros volume (seulement si exploitée), `npm:` pour un paquet exact.
