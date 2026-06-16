# Flowbo

Un tableau Kanban simple et élégant construit avec **React**, **Vite** et **@dnd-kit**.

L'application est entièrement fonctionnelle avec des tests unitaires et des tests d'intégration.
Votre mission est de mettre en place un pipeline CI/CD pour automatiser les tests et le déploiement.

## Démarrage

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- npm (inclus avec Node.js)

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvre l'application sur [http://localhost:5173](http://localhost:5173) (ou le port indiqué par Vite).

### Build de production

```bash
npm run build
```

Les fichiers prêts pour la production seront dans le dossier `dist/`.

Vous pouvez ensuite prévisualiser le build avec :

```bash
npm run preview
```

## Linting

Pour vérifier la qualité du code via ESLint :

```bash
npm run lint
```

## Lancer les tests

Ce projet utilise **Vitest** et contient deux types de tests :

### Tests unitaires uniquement

```bash
npm run test:unit
```

### Tests d'intégration uniquement

```bash
npm run test:integration
```

### Couverture de code

Pour générer un rapport de couverture de code :

```bash
npm run test:coverage
```

## Intégration et livraison continues (CI/CD)

Le pipeline est défini dans `.github/workflows/ci.yml` et se déclenche sur chaque `push` et chaque `pull request` ciblant la branche `main`.

### Vue d'ensemble du pipeline

Le pipeline est composé de six jobs exécutés dans un ordre défini par des dépendances (`needs`), de sorte que les contrôles de sécurité bloquent l'exécution des étapes suivantes en cas d'échec :

| Job | Rôle | Dépend de |
| --- | --- | --- |
| `security` | Détection de secrets dans l'historique complet du dépôt avec Gitleaks | — |
| `semgrep` | Analyse statique de sécurité du code (SAST) avec Semgrep | `security` |
| `audit` | Analyse de composition logicielle (SCA) via `npm audit` | `security`, `semgrep` |
| `lint` | Vérification de la qualité du code avec ESLint | `security`, `semgrep`, `audit` |
| `test` | Tests unitaires, tests d'intégration et rapport de couverture | `security`, `semgrep`, `audit` |
| `deploy` | Build de production et déploiement sur Netlify | `lint`, `test` |

### Déclencheurs

- **push sur `main`** : exécute l'ensemble du pipeline, y compris le job `deploy`.
- **pull request vers `main`** : exécute tous les jobs sauf `deploy`, qui ne se déclenche que sur un push direct vers `main`.

### Détail des jobs

- **security (Gitleaks)** : récupère l'intégralité de l'historique (`fetch-depth: 0`) et détecte la présence de secrets (clés d'API, identifiants, tokens) dans le code et l'historique. Bloque tout le pipeline en cas de détection. En cas d'échec, le rapport SARIF est publié en artefact.
- **semgrep (SAST)** : analyse statique du code dans le conteneur officiel `semgrep/semgrep`, authentifiée via `SEMGREP_APP_TOKEN`. Ne s'exécute pas pour les pull requests de `dependabot[bot]`.
- **audit (SCA)** : exécute `npm audit --audit-level=moderate` ; échoue si une vulnérabilité de niveau `moderate` ou supérieur est détectée dans les dépendances.
- **lint** : exécute `npm run lint` (zéro avertissement toléré avec notre configuration actuelle).
- **test** : exécute `npm run test:unit`, `npm run test:integration`, puis `npm run test:coverage`. Le rapport de couverture est publié en artefact (`coverage-report`).
- **deploy** : ne s'exécute que sur un push vers `main` et seulement si `lint` et `test` sont passés. Installe les dépendances, exécute `npm run build`, puis déploie le dossier `dist/` sur Netlify via `netlify-cli` (`--prod`).

### Secrets utilisés par le pipeline

| Secret | Usage |
| --- | --- |
| `GITHUB_TOKEN` | Fourni automatiquement par GitHub Actions, utilisé par Gitleaks |
| `SEMGREP_APP_TOKEN` | Authentification du job `semgrep` auprès de Semgrep App |
| `NETLIFY_AUTH_TOKEN` | Authentification du déploiement Netlify |
| `NETLIFY_SITE_ID` | Identifiant du site Netlify cible pour le déploiement |

Ces secrets sont configurés dans **Settings > Secrets and variables > Actions** du dépôt GitHub et ne doivent jamais apparaître en clair dans le code ou les fichiers de configuration versionnés.

## Évolutivité

### Décision d'architecture

Le pipeline a été conçu autour des principes suivants :

- **Sécurité avant tout** : le job `security` (détection de secrets) est exécuté en premier et bloque l'ensemble du pipeline en cas de détection, conformément à une approche *shift left* de la sécurité.
- **Défense en profondeur** : trois contrôles de sécurité complémentaires sont enchaînés avant toute exécution de code applicatif : détection de secrets (Gitleaks), analyse statique du code (Semgrep) et analyse des dépendances tierces (`npm audit`).
- **Parallélisation des contrôles indépendants** : les jobs `lint` et `test` partagent les mêmes dépendances (`security`, `semgrep`, `audit`) et s'exécutent en parallèle pour réduire la durée totale du pipeline.
- **Déploiement conditionnel** : le job `deploy` n'est déclenché que sur un push vers `main`, garantissant qu'aucun code issu d'une pull request non fusionnée n'est jamais publié.
- **Déploiement uniquement après validation complète** : `deploy` dépend de `lint` et `test`, qui dépendent eux-mêmes de toute la chaîne de sécurité, garantissant qu'aucun build non valide ou non sécurisé n'est mis en production.
- **Exclusion ciblée de Dependabot pour Semgrep**, afin d'éviter une consommation inutile de quota d'analyse sur les pull requests automatiques de mise à jour de dépendances.

### Ajouter une étape au pipeline

Pour ajouter un nouveau job ou une nouvelle étape au pipeline :

1. **Identifier la position logique** du nouveau contrôle dans la chaîne : un contrôle de sécurité ou de qualité doit être placé avant `lint`, `test` et `deploy`. Une étape de post-traitement (notification, publication d'artefact supplémentaire) peut être placée après `deploy`.
2. **Ajouter le job** dans `.github/workflows/ci.yml`, en définissant `runs-on`, les `steps` nécessaires et, le cas échéant, l'image de conteneur à utiliser.
3. **Déclarer les dépendances avec `needs`** : si le job est un contrôle bloquant, l'ajouter à la liste `needs` des jobs `lint` et `test` (et donc transitivement de `deploy`). S'il doit aussi bloquer `deploy` directement, l'ajouter explicitement dans son `needs`.
4. **Ajouter les secrets nécessaires** dans **Settings > Secrets and variables > Actions** et les référencer via `env` dans le job.
5. **Publier les rapports éventuels** en artefact avec `actions/upload-artifact`, à l'image des jobs `security` et `test`.
6. **Tester sur une branche dédiée** via une pull request : vérifier que le nouveau job s'exécute dans le bon ordre et que les jobs existants ne sont pas cassés.
7. **Documenter le nouveau job** (rôle, dépendances, secrets utilisés) avant la fusion.

### Guide de contribution

Toute contribution au dépôt doit respecter le cycle suivant :

1. Créer une branche depuis `main`, nommée de manière descriptive (par exemple `feat/drag-and-drop-mobile` ou `fix/coverage-report`).
2. Développer la fonctionnalité ou le correctif en respectant des **commits atomiques et explicites** (convention `type(scope): description`, ex. `feat(board): add drag-and-drop between columns`).
3. Exécuter localement `npm run lint`, `npm run test:unit`, `npm run test:integration` et `npm run test:coverage` avant de pousser les changements.
4. Pousser la branche et ouvrir une **pull request vers `main`**, avec une description claire de l'objectif du changement (contexte, lien vers l'issue associée si pertinent).
5. Attendre que les jobs `security`, `semgrep`, `audit`, `lint` et `test` du pipeline CI passent au vert.
6. Solliciter une **revue par un pair**, ou réaliser une **auto-revue argumentée** (relecture complète du diff, vérification de la checklist de revue, justification explicite dans la description de la PR) si aucun pair n'est disponible dans un délai raisonnable.
7. Après approbation et CI au vert, fusionner la pull request sur `main`.
8. Le push sur `main` déclenche automatiquement le job `deploy`, qui construit et publie l'application sur Netlify.

#### Points de vigilance

- Ne jamais commiter de secrets, clés d'API ou identifiants : ils seraient détectés par le job `security` et bloqueraient le pipeline.
- Ne jamais ajouter de dépendance non utilisée ou connue comme vulnérable : elle serait détectée par le job `audit`.
- Toute modification du pipeline (`.github/workflows`) doit être revue avec la même rigueur que le code applicatif, car elle impacte directement la sécurité et la disponibilité des déploiements.

> Pour le détail complet (politique de pull request, glossaire, dépannage du pipeline, évolutivité du code applicatif, gestion des dépendances et versioning), se référer à la documentation technique complète du projet.

## Documentation technique

Une documentation technique complète est disponible pour les contributeurs et mainteneurs du projet, couvrant les sujets suivants :

- Politique de pull request et conventions de commit
- Glossaire des termes et concepts utilisés dans le projet
- Dépannage du pipeline CI/CD et résolution des erreurs fréquentes
- Stratégies d'évolutivité du code applicatif et bonnes pratiques de développement
- Gestion des dépendances et versioning, y compris la politique de mise à jour et de sécurité des packages tiers

Vous pouvez accéder à cette documentation dans le dossier zippé 2004, ou via demandes internes pour obtenir un accès direct à la documentation en ligne.

### Ressources supplémentaires

Pour obtenir les secrets nécessaires à l'exécution du pipeline, veuillez contacter l'administrateur du projet ou consulter la documentation interne de l'organisation.
Un keepass ou gestionnaire de mots de passe sécurisé est utilisé pour stocker et partager les secrets de manière sécurisée entre les membres autorisés du projet.
Des instructions détaillées quant à la configuration de l'environnement de développement, des outils utilisés et des bonnes pratiques de contribution sotn également disponibles dans la documentation technique complète.
