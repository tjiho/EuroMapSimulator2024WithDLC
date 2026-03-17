# Utils - Scripts de conversion

## convert.py

Convertit les données brutes d'élections vers le format attendu par la carte (`index.html`).

### Ce que fait le script

1. **Résultats** : transforme le JSON brut (colonnes alternées code/votes) en un format normalisé avec les votes dans `column_20`, `column_22`, etc.
2. **Géométrie** : convertit un GeoJSON FeatureCollection en tableau JSON simple, et rattache les bureaux avec suffixes (ex: "054A") au lieu de vote de leur bureau parent.

### Prérequis

- Python 3 (pas de dépendances externes)

### Usage

```bash
# Depuis le dossier utils/
python3 convert.py

# Ou avec des fichiers spécifiques
python3 convert.py ../resultats-elections-municipales-2026-1er-tour.json ../elections-2024-lieux-de-vote.geojson
```

### Fichiers produits

- `municipales-2026-resultats.json` : résultats convertis (à la racine du projet)
- `elections-municipales-2026-lieux-de-vote.json` : géométrie convertie (à la racine du projet)

### Adapter pour une future élection

1. Placer le fichier de résultats brut à la racine du projet
2. Modifier les constantes `INPUT_RESULTATS` et `OUTPUT_RESULTATS` dans le script (ou passer les fichiers en argument)
3. Vérifier que la structure des colonnes est la même (colonnes paires = votes, impaires = codes). Si le nombre de candidats change, ajuster `COLONNES_VOTES_SOURCE`.
4. Mettre à jour `nomDesListes` dans `index.html` avec les nouveaux noms de listes.
