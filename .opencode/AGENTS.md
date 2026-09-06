# Config Claude Code — scope utilisateur

## Mise à jour des skills/agents/commandes

Les skills, agents et commandes transverses à tous les projets vivent dans `~/.claude/` (`skills/`, `agents/`, `commands/`, `settings.json`) — c'est la source de vérité, chargée automatiquement dans toutes les sessions, quel que soit le projet ouvert.

- Si on demande de mettre à jour/corriger un skill, un agent ou une commande depuis une session ouverte dans un projet, éditer le fichier dans `~/.claude/`, pas une éventuelle copie locale dans `<projet>/.claude/`.
- Vérifier qu'il n'existe pas de fichier de même nom en local au projet avant de conclure que l'édition globale suffit (un `.claude/` local prendrait le dessus sur le global).
- Une copie de sauvegarde existe dans `~/Documents/agentic-workflow-files/.claude/` (clonée sur d'autres machines pour versioning) — ce n'est **pas** une source lue par le harnais, juste un backup. Si demandé, reporter le même changement là aussi (copie simple, pas de symlink entre les deux).
