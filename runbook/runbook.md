# Runbook - {{Nom de l'application}}
> Procédure à suivre en cas d'incident en production. À copier dans `docs/runbook.md` du projet, à remplir **avant** le premier incident, et à garder court : on le lit sous stress.
>
> Dernière mise à jour : {{date}} - Dernier test de rollback et de restauration : {{date}}

⚠️ **Aucun secret dans ce fichier** (mots de passe, clés, tokens) : il vit dans le repo. Indiquer seulement **où** trouver le secret (ex. nom de l'entrée Bitwarden).

---

## 🟥 En cas d'incident - les 10 premières minutes

1. **Confirmer** : le problème est-il réel et côté serveur ? (`curl` du health check, section 3 - pas seulement un retour client isolé)
2. **Qualifier la gravité** (tableau ci-dessous) - si des **données personnelles ont pu fuiter**, ouvrir aussi la section 7 (délai légal de 72 h).
3. **Un seul responsable** de l'incident : c'est lui qui agit sur la prod. Ouvrir le journal (section 2) et noter l'heure de chaque action.
4. **Prévenir les clients** si P1/P2 (modèles de message, section 2).
5. **Rétablir d'abord, corriger ensuite** : rollback vers le dernier tag stable (section 4). Pas de correctif à chaud directement sur le serveur.
6. **Vérifier** le retour à la normale (section 6), puis prévenir les clients.
7. **Post-mortem** dans les {{48 h}} (section 8).

| Gravité | Définition | Exemple | Délai de rétablissement visé (SLA) | Prévenir les clients |
|---|---|---|---|---|
| **P1** | Service coupé ou données en danger | Site inaccessible, base corrompue, fuite | {{ex. 4 h ouvrées}} | Oui, immédiatement |
| **P2** | Service dégradé | Lenteurs fortes, une fonctionnalité clé en panne | {{ex. 1 jour ouvré}} | Oui, si visible par eux |
| **P3** | Gêne mineure, contournement possible | Bug d'affichage, export en erreur | {{ex. prochaine release}} | Non (ticket) |

---

## 1. Fiche d'identité

| Élément | Valeur |
|---|---|
| URL production | {{https://app.exemple.fr}} |
| URL instance de test | {{https://test.app.exemple.fr}} |
| Health check | {{https://app.exemple.fr/api/health}} |
| Repo GitHub | {{owner/repo}} |
| Images Docker | {{ghcr.io/owner/app-backend, ghcr.io/owner/app-frontend}} |
| Serveur (hébergeur, IP, OS) | {{ex. VPS OVH, 203.0.113.10, Debian 13}} |
| Dossier de l'app sur le serveur | {{/opt/app}} (contient `docker-compose.yml` et `.env`) |
| DNS / registrar | {{ex. OVH}} |
| Emails transactionnels | {{fournisseur SMTP}} |
| Sauvegardes | {{où, fréquence, rétention - ex. dump quotidien 3 h, 30 jours, copie hors serveur}} |

## Contacts et accès

| Qui / quoi | Contact | Accès (où est le secret) |
|---|---|---|
| Responsable technique | {{nom, téléphone}} | - |
| Accès SSH serveur | `ssh {{user}}@{{ip}}` | Clé SSH : {{emplacement}} |
| Hébergeur (support) | {{lien / téléphone}} | Bitwarden : {{nom de l'entrée}} |
| Registrar / DNS | {{lien}} | Bitwarden : {{nom de l'entrée}} |
| GitHub (secrets, Actions) | {{owner/repo}} → Settings → Environments | Compte {{…}} |
| Client(s) à prévenir | {{nom, email}} | - |

---

## 2. Journal d'incident et communication

**Journal** (une ligne par action, heure comprise - c'est la base du post-mortem) :

```markdown
## Incident {{AAAA-MM-JJ}} - {{résumé en une ligne}}
Gravité : P{{1/2/3}} - Responsable : {{nom}}

- HH:MM - Détection : {{alerte / ticket / constat}}
- HH:MM - Constat : {{ce qu'on observe, commande et résultat}}
- HH:MM - Action : {{ce qu'on fait}}
- HH:MM - Résultat : {{effet de l'action}}
- HH:MM - Service rétabli
```

**Message de début d'incident** (P1/P2) :

> Bonjour, nous rencontrons actuellement un problème sur {{Nom de l'application}} : {{symptôme visible, sans jargon}}. Nos équipes sont dessus. Prochain point à {{heure}}. Vos données {{ne sont pas affectées / font l'objet d'une vérification}}.

**Message de fin d'incident** :

> Le service {{Nom de l'application}} est rétabli depuis {{heure}}. Cause : {{une phrase}}. Nous avons {{mesure prise}} pour éviter que cela se reproduise. Merci de votre patience.

---

## 3. Diagnostic rapide

Sur le serveur, dans `{{/opt/app}}` :

```bash
curl -fsS {{https://app.exemple.fr/api/health}}          # l'app répond-elle ?
docker compose ps                                         # un conteneur arrêté ou en restart ?
docker compose logs --since 30m backend | tail -200      # erreurs récentes (logs Winston)
df -h                                                     # disque plein ? (cause classique : logs, dumps)
free -m && docker stats --no-stream                       # mémoire / CPU saturés ?
docker compose exec db psql -U {{user}} -d {{db}} \
  -c "select state, count(*) from pg_stat_activity group by state;"   # connexions PostgreSQL
echo | openssl s_client -connect {{domaine}}:443 -servername {{domaine}} 2>/dev/null \
  | openssl x509 -noout -dates                            # certificat SSL expiré ?
```

| Symptôme | Piste |
|---|---|
| Conteneur en boucle de redémarrage | `docker compose logs <service>` : variable d'env manquante, migration en échec au démarrage |
| Erreur 502 / 504 | Backend arrêté ou trop lent, config du reverse proxy ({{Traefik / nginx}}) |
| Tout est lent | Requête SQL lente (logs slow queries), mémoire saturée, disque plein |
| Erreur juste après un déploiement | Rollback immédiat (section 4) : c'est presque toujours le dernier changement |

---

## 4. Rollback - revenir au dernier tag stable

Les migrations sont pensées pour rester compatibles avec la version précédente (colonnes ajoutées d'abord, données ensuite) : on peut donc **revenir à l'ancienne version de l'app sans toucher à la base**. Ne jamais annuler une migration à la main en urgence.

1. Trouver le dernier tag stable :
   ```bash
   gh release list --repo {{owner/repo}} --limit 5
   ```
2. Redéployer ce tag :
   - **Via la CI** (préféré, trace dans GitHub) : {{ex. relancer le job deploy du tag précédent - `gh run list --workflow={{deploy.yml}}` puis `gh run rerun <id>`}}
   - **À la main sur le serveur** (si la CI est indisponible) :
     ```bash
     cd {{/opt/app}}
     sed -i 's/^{{APP_VERSION}}=.*/{{APP_VERSION}}={{vX.Y.Z}}/' .env   # tag stable
     docker compose pull && docker compose up -d
     ```
3. Noter l'heure et le tag dans le journal, puis passer à la vérification (section 6).

## 5. Restauration de la base (dernier recours)

Uniquement si les données sont corrompues ou perdues - **toute donnée saisie depuis la sauvegarde sera perdue**. Prévenir le client avant.

```bash
cd {{/opt/app}}
# 1. Sauvegarder l'état actuel, même cassé (pour enquête et pour pouvoir revenir en arrière)
docker compose exec -T db pg_dump -U {{user}} -Fc {{db}} > avant-restauration-$(date +%F-%H%M).dump
# 2. Couper l'app pour éviter les écritures pendant la restauration
docker compose stop backend
# 3. Restaurer la sauvegarde choisie
docker compose exec -T db pg_restore -U {{user}} -d {{db}} --clean --if-exists < {{chemin/vers/sauvegarde.dump}}
# 4. Relancer
docker compose start backend
```

> Une sauvegarde jamais restaurée n'est pas une sauvegarde : tester cette procédure sur l'instance de test **avant** d'en avoir besoin (voir section 9).

---

## 6. Hotfix et vérification

**Hotfix** (une fois le service rétabli, à tête reposée) :

1. Branche depuis le tag en production : `git checkout -b hotfix/{{description}} {{vX.Y.Z}}`
2. Correctif **minimal** + test qui reproduit le bug (il doit échouer avant le correctif, passer après).
3. PR → CI verte → revue (`/code-review`) → merge → nouveau tag `{{vX.Y.Z+1}}` → déploiement.
4. Reporter le correctif sur la branche de dev si elle a divergé.

**Vérifier le retour à la normale** :

- [ ] Health check OK, tous les conteneurs `Up` (`docker compose ps`)
- [ ] Plus d'erreurs dans les logs depuis {{15 min}}
- [ ] Monitoring revenu aux valeurs habituelles (temps de réponse, mémoire)
- [ ] Parcours client principal testé à la main : {{ex. connexion → créer X → exporter}}
- [ ] Clients prévenus de la fin de l'incident

---

## 7. Fuite de données personnelles (RGPD)

Toute violation (accès non autorisé, perte, divulgation) **même supposée** déclenche ce circuit :

1. **Contenir** : couper l'accès en cause (révoquer token/clé, changer les mots de passe, fermer le port).
2. **Documenter** dans le registre des violations : nature, données et personnes concernées, conséquences probables, mesures prises.
3. **Notifier la CNIL sous 72 h** après en avoir pris connaissance (art. 33), sauf si la violation est sans risque pour les personnes - [procédure CNIL](https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles).
4. **Informer les personnes concernées** si le risque pour elles est élevé (art. 34).
5. En SaaS B2B (sous-traitant) : **prévenir le client sans délai** - c'est lui, responsable de traitement, qui notifie la CNIL (art. 33.2). Vérifier le délai prévu au DPA : {{délai}}.

---

## 8. Post-mortem (sans reproche)

On cherche ce qui, dans le **processus**, a permis l'incident - pas un coupable. À ranger dans {{docs/incidents/AAAA-MM-JJ.md}}.

```markdown
# Post-mortem - {{AAAA-MM-JJ}} - {{résumé}}

**Gravité :** P{{n}} - **Durée :** {{début → fin}} - **Impact :** {{qui, quoi, combien}}

## Chronologie
(copier le journal d'incident)

## Cause racine
{{Pourquoi c'est arrivé - poser "pourquoi ?" jusqu'à tomber sur le processus}}

## Ce qui a bien marché / ce qui a manqué
- {{…}}

## Actions correctives
| Action | Responsable | Échéance |
|---|---|---|
| {{ex. test de non-régression sur X}} | {{…}} | {{date}} |
| {{ex. alerte monitoring sur Y}} | {{…}} | {{date}} |
```

---

## 9. Entretien de ce runbook

- Tous les {{3 mois}} : tester le **rollback** et la **restauration** sur l'instance de test, mettre à jour les dates en haut de ce fichier.
- Après chaque incident : corriger ce qui manquait ou était faux ici.
- À chaque changement d'infra (serveur, hébergeur, reverse proxy, domaine) : mettre à jour la section 1.
