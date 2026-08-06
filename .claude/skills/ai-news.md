---
name: ai-news
description: Synthese des actualites IA du jour — grandes entreprises, modeles locaux, economie, robotique, cybersecurite, regulation.
---

---

## OBJECTIF

Produire un briefing IA quotidien complet, en francais, structure par sections, avec contexte technique explique, sources verifiees <=48h. Format: dense mais lisible en 5 minutes. Pas d'emoji (incompatible avec le terminal de l'utilisateur) — utiliser des symboles texte: *, ->, [OK], [~], [!], --, •.

---

## ETAPE 1 — VERIFIER LA DATE DU JOUR

Confirmer la date depuis le contexte systeme. Ne jamais l'improviser.
- J = aujourd'hui | J-1 = hier → section principale
- J-2 a J-5 → section "Cette semaine" uniquement
- J-6 et au-dela → rejeter sans exception

---

## ETAPE 2 — COLLECTE (lancer TOUT en parallele)

### Source principale : BuildFastWithAI

Fetcher LES DEUX formats d'URL en parallele (l'un d'eux retournera le contenu) :
- Format texte : https://www.buildfastwithai.com/blogs/ai-news-today-[mois-en]-[j]-[annee]
  Exemple pour le 8 juin 2026 : https://www.buildfastwithai.com/blogs/ai-news-today-june-8-2026
- Format ISO  : https://www.buildfastwithai.com/blogs/ai-news-today-[YYYY-MM-DD]
  Exemple pour le 8 juin 2026 : https://www.buildfastwithai.com/blogs/ai-news-today-2026-06-08
- Si les deux echouent, essayer J-1 avec les memes deux formats.

Noms de mois en anglais : january, february, march, april, may, june, july, august, september, october, november, december.

### Sources complementaires par section (lancer en parallele avec BuildFastWithAI) :

**Grandes entreprises (Microsoft, Google, Meta, Nvidia, DeepSeek, OpenAI, Anthropic, xAI)**
- Recherche: `AI news today [jour] [mois] [annee]`
- Recherche: `[entreprise] AI announcement [mois] [annee]`
- Sources: TechCrunch, The Verge, CNBC, VentureBeat, Ars Technica, Reuters
- Blogs officiels: ai.meta.com, blogs.microsoft.com, blog.google, nvidianews.nvidia.com, anthropic.com/news

**Cybersecurite & menaces IA**
- Recherche: `AI cybersecurity threat attack vulnerability [mois] [annee]`
- Recherche: `AI malware phishing deepfake cyberattack [mois] [annee]`
- Recherche: `LLM jailbreak exploit security [mois] [annee]`
- Sources: Krebs on Security, Bleeping Computer, The Record (recordedfuture.com), Dark Reading,
  Wired Security, CISA advisories (cisa.gov), CVE MITRE, Schneier on Security

**Modeles locaux & outils dev**
- Recherche: `local LLM small model release [mois] [annee]`
- Recherche: `Ollama new model [mois] [annee]`
- Sources: Hugging Face blog, llm-stats.com, latent.space, ollama.com/library, Simon Willison's blog

**Economie de l'IA**
- Recherche: `AI startup funding IPO acquisition [mois] [annee]`
- Sources: TechCrunch Funding, Crunchbase News, Bloomberg, Reuters

**Regulation**
- Recherche: `AI regulation law bill [mois] [annee]`
- Sources: Axios, The Verge Policy, EFF, Politico

**Robotique**
- Recherche: `humanoid robot AI announcement [mois] [annee]`
- Sources: IEEE Spectrum, TechCrunch, The Verge

---

## ETAPE 3 — VERIFICATION STRICTE DES DATES (CRITIQUE)

Pour chaque story :
1. Verifier la date dans les metadonnees de l'article (URL avec date, balise datePublished, byline)
2. Si doute: recherche `"titre" site:source.com [date]` pour confirmer
3. Rejeter toute story sans date confirmee
4. Trier : J/J-1 = section principale | J-2 a J-5 = "Cette semaine" | J-6+ = ignorer

---

## ETAPE 4 — FORMAT DE SORTIE EXACT

Produire dans ce format (pas d'emoji, texte brut + symboles ASCII) :

```
Synthese IA - [JJ mois YYYY] | Sources verifiees <=48h
================================================================

FAITS MAJEURS DU JOUR
---------------------
[3 a 4 stories les plus importantes, avec contexte complet]

• [Titre court] - [Acteur], [date] -- [URL source directe]
  [2-3 phrases. Ce qui change concretement.
  Expliquer les termes techniques entre parentheses si necessaire.
  Implications pratiques. C'est encore [stade] si applicable.]

• ...

================================================================
PAR ACTEUR
----------

[Anthropic / OpenAI / Google / Microsoft / Nvidia / Meta / xAI / Apple / DeepSeek]
(n'inclure que les acteurs avec news J ou J-1)

[Nom acteur]
* [Titre court] ([date]) - [1-2 phrases. Chiffres concrets si dispo.]
* [~] [Titre] ([date]) - [Rumeur/leak: preciser le niveau de credibilite.]
* ...

================================================================
CYBERSECURITE & MENACES IA
--------------------------
[Attaques, vulnerabilites, exploits, armes IA, deepfakes offensifs,
 jailbreaks notables, rapports CISA/MITRE, alertes sectorielles]

• [Titre] - [Acteur/Victime], [date] -- [URL]
  [2-3 phrases. Vecteur d'attaque concret. Qui est expose. Mitigation si connue.]
  Severite: [Critique / Haute / Moyenne] | CVE: [numero si applicable]

• ...

================================================================
RECHERCHE & SCIENCE
-------------------
[Publications, benchmarks, declarations de chercheurs]
• ...

================================================================
REGULATION & SOCIETE
--------------------
[Lois, projets de loi, politiques, controverses]
• ...

================================================================
OPEN SOURCE
-----------
[Nouveaux modeles open-weight, releases notables]
• [Modele] ([organisation]) - Architecture: [details]. Licence: [MIT/Apache/autre].
  Benchmarks: [chiffres cles]. Disponible sur: [Ollama/HuggingFace/etc.]
• ...

================================================================
COIN DEV — MODELES & OUTILS
----------------------------

Pour remplir cette section, consulter en parallele :
llm-stats.com/llm-updates | llm-stats.com/ai-news | artificialanalysis.ai | openrouter.ai/models

--- MEILLEURS MODELES FRONTIER (via API) ---

Lister les 5-6 modeles les plus capables actuellement disponibles via API.
Marquer [NEW] si sorti dans les 7 derniers jours. Mettre a jour a chaque briefing.

| Modele                | Editeur    | In / Out ($/M tok) | Points forts               |
|-----------------------|------------|--------------------|----------------------------|
| [NEW?] [nom]          | [editeur]  | $X.XX / $X.XX      | [codage / raisonnement / …] |
| ...                   |            |                    |                            |

--- MODELES LOCAUX — PAR PALIER MATERIEL ---

Inclure tous les modeles notables pour chaque palier. Mettre [NEW] si sorti cette semaine.
Vitesse en tokens/seconde = estimation sur le materiel min indique.

[PALIER 1 — PC GAMER / MAC M-SERIES] 8-24 Go VRAM ou RAM unifiee
| Modele              | Params actifs | VRAM/RAM min | ~tok/s | Usage ideal              |
|---------------------|---------------|--------------|--------|--------------------------|
| [NEW?] [nom]        | [xB actifs]   | [x Go]       | ~[x]   | [chat / code / RAG / …]  |
| ...                 |               |              |        |                          |

[PALIER 2 — WORKSTATION / RTX 4090] 24-48 Go VRAM
| Modele              | Params actifs | VRAM/RAM min | ~tok/s | Usage ideal              |
|---------------------|---------------|--------------|--------|--------------------------|
| ...                 |               |              |        |                          |

[PALIER 3 — DATACENTER / MULTI-GPU] 80 Go+ VRAM
| Modele              | Params actifs | VRAM/RAM min | ~tok/s | Usage ideal              |
|---------------------|---------------|--------------|--------|--------------------------|
| ...                 |               |              |        |                          |

* MoE (Mixture of Experts) : seuls les params actifs comptent pour la VRAM
* Quantization Q4 : reduit la VRAM d'~50% avec degradation mineure des perfs
* Mac M-series : RAM unifiee = pas de VRAM separee, compter la RAM totale

--- OUTILS & INTEGRATIONS ---
• [Outil] ([date si nouveau]) - [1 phrase. Ce que ca fait concretement pour un dev.]
• ...

TIP DU JOUR:
[1 commande ou astuce pratique concrete — ollama run X, snippet Python, appel API, etc.]

================================================================
CETTE SEMAINE (J-2 a J-5)
--------------------------
[Stories importantes mais hors fenetre 48h — dater chaque item precisement]
• [date] - [Acteur] - [1-2 phrases.]
• ...

================================================================
A SURVEILLER
------------
• [date] - [Evenement attendu]
• ...

================================================================
INTENSITE DU JOUR
-----------------
[Calme / Actif / Agite / Tres agite / Historique]
[1-2 phrases resumant pourquoi cette journee est notable ou non]

================================================================
Sources:
- [Titre] ([date]) - [URL]
- ...

* Baked for [X]m [Y]s
```

---

## REGLES DE STYLE

- Francais pour tout le texte. Termes techniques en anglais avec traduction entre parentheses a la premiere occurrence
- Phrases courtes: sujet-verbe-complement
- Pas de jargon marketing: pas de "revolutionnaire", "game-changer", "pionnier"
- Chiffres concrets partout: params en milliards, montants en USD/EUR, dates precises
- Expliquer les acronymes au premier usage: MoE (Mixture of Experts: seule une partie du modele s'active selon la tache), SWE-Bench (mesure la capacite a resoudre de vraies issues GitHub), CVE (Common Vulnerabilities and Exposures: identifiant standardise de vulnerabilite), etc.
- Section vide = "Rien de confirme ce jour." Ne pas remplir avec du contenu non verifie
- [OK] = confirme officiellement | [~] = rumeur/leak (preciser credibilite) | [!] = attention/alerte

---

## PIEGES A EVITER

- Ne jamais inclure une story J-6+ dans les sections principales (ni dans PAR ACTEUR, ni dans CYBERSECURITE)
- Ne jamais confondre popularite (trending) et recence
- Ne jamais improviser la date du jour
- Ne pas abreger les explications techniques au point de les rendre incomprehensibles
- Si BuildFastWithAI retourne 404 sur le format ISO, essayer immediatement le format texte avant de chercher ailleurs
