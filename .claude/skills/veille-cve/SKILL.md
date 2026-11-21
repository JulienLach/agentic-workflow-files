---
name: veille-cve
description: Veille sécurité du jour - CVE et failles qui touchent MA stack (Node, nginx, Apache, PostgreSQL, Docker, paquets npm...) depuis les flux officiels à jour à l'heure près. Utiliser quand l'utilisateur lance /veille-cve [heures], demande les dernières CVE, les failles du jour ou si sa stack est touchée par une vulnérabilité.
---

# /veille-cve - failles de ma stack

Fenêtre : `$ARGUMENTS` en heures si fourni, sinon 72 h. Une CVE reste donc visible 3 jours, ce qui évite de rater celle de l'avant-veille. Date du jour : celle du contexte système.

## 1. Collecte (une seule commande, seule source de données)

`node ~/.claude/skills/veille-cve/collect.ts <heures>`

Sources, toutes officielles et structurées :

| Source | Rôle |
|---|---|
| NVD (NIST) | découverte de toutes les CVE de la fenêtre |
| CVE.org (CVE Program) | confirmation : produit et versions corrigées déclarés par l'éditeur |
| CISA KEV + ENISA EUVD | exploitation active (US + UE) |
| EPSS (FIRST) | probabilité d'exploitation, sert au tri |
| GitHub Advisories | paquets npm de la stack |
| CERT-FR (ANSSI) | alertes et avis en français |

Le script fait déjà le filtrage et le tri : produit confirmé par CVE.org, puis exploitée > EPSS > CVSS. Il donne aussi les versions corrigées. Ne pas chercher de CVE ni de version par WebSearch : ce serait moins à jour et non reproductible. Une source `[!] en échec` se signale en une ligne, sans la remplacer.

## 2. Analyse (ce que le script ne sait pas faire)

- Reprendre les CVE de la sortie dans son ordre. Les lignes `(écartées par CVE.org...)` ne s'affichent pas.
- `produit non confirmé par CVE.org` : garder seulement si la 1re phrase de la description désigne la techno elle-même.
- Versions : comparer `corrigé :` aux versions en commentaire dans `stack.txt` (ex. `postgres:14-alpine`), et dire si la version utilisée est touchée.
- Paquet apt du VPS (Debian 13 trixie, voir `stack.txt`) : la version amont ne compte pas, car Debian applique les correctifs sur sa propre version. La seule référence est le Debian Security Tracker :
  `curl -sL https://security-tracker.debian.org/tracker/<CVE> | sed 's/<[^>]*>/ /g' | tr -s ' \t\n' ' ' | grep -oE 'trixie( \(security\))? [^ ]+ (fixed|vulnerable)'`
  Donner dans `à faire :` la version Debian corrigée, et la commande `dpkg -l <paquet>` pour comparer.
- CVE qui dépend d'une option (HTTP/2, TLS, proxy, module...) : lire la config concernée dans les repos de l'utilisateur (`gh api repos/JulienLach/<repo>/contents/<fichier>`) et dire si elle est exposée.
- Avis CERT-FR noyau Linux : une seule ligne, en ne citant que Fedora/Red Hat.

## 3. Sortie

Bloc de code texte brut, français avec accents, sans emoji ni tableau. Expliquer tout terme non évident à sa première occurrence (ex. "use-after-free (réutilisation d'une zone mémoire déjà libérée)").

```
SÉCU STACK - [JJ mois AAAA] ([fenêtre] h)

- [!] [CVE] [techno] CVSS [score] EPSS [x %] ([date], [EXPLOITÉE] si exploitée) -> [url]
  [1-2 phrases : vecteur d'attaque, qui est exposé concrètement.]
  à faire : [version corrigée (ligne "corrigé :") / mitigation / "pas concerné : ..."]

Rien d'autre sur ta stack.   <- si la liste est vide, cette seule ligne
```

Maximum 8 items. Au-delà, ou pour plusieurs CVE d'un même correctif, regrouper par techno (`nginx : 6 CVE, toutes corrigées en 1.30.7 / 1.31.9`).

## Ajuster le périmètre

Éditer `~/.claude/skills/veille-cve/stack.txt` : une techno par ligne, `kev:` pour les technos à gros volume (seulement si exploitée), `npm:` pour un paquet exact. Le nom doit correspondre au produit tel que l'éditeur le déclare dans CVE.org (ex. "NGINX Open Source", "PostgreSQL").
