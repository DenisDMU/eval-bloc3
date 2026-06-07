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
