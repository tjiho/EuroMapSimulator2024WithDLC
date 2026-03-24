#!/usr/bin/env python3
"""
Script de conversion des données électorales brutes vers le format attendu par la carte.

Convertit :
- Les résultats (JSON avec colonnes alternées code/votes) → format column_20, column_22, etc.
- La géométrie (GeoJSON FeatureCollection) → tableau JSON simple
"""

import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

# Fichiers d'entrée (par défaut)
# INPUT_RESULTATS = os.path.join(PROJECT_DIR, "resultats-elections-municipales-2026-1er-tour.json")
# INPUT_GEO = os.path.join(PROJECT_DIR, "elections-2024-lieux-de-vote.geojson")

# Colonnes paires contenant les votes (18, 20, 22, ..., 36)


def convertir_resultats(fichier_entree, fichier_sortie):
    """Convertit les résultats du format brut vers le format attendu par index.html."""
    with open(fichier_entree, encoding="utf-8") as f:
        donnees = json.load(f)

    resultats = []
    for bureau in donnees:
        record = {"column_7": bureau["column_7"], "inscrits": bureau["column_9"],
                  "votants": bureau["column_11"], "blanc": bureau["column_13"], "nul": bureau["column_14"]}
        for i, col_source in enumerate(range(18, len(donnees[0])+1, 2)):
            col_cible = 18 + i * 2  # column_18, column_20, column_22, ..., column_38
            record[f"column_{col_cible}"] = bureau[f"column_{col_source}"]
        resultats.append(record)

    with open(fichier_sortie, "w", encoding="utf-8") as f:
        json.dump(resultats, f, ensure_ascii=False)

    print(f"Résultats : {len(resultats)} bureaux -> {fichier_sortie}")


def convertir_geometrie(fichier_geo, fichier_resultats, fichier_sortie):
    """Convertit le GeoJSON en tableau simple et ajoute les bureaux avec suffixes."""
    with open(fichier_geo, encoding="utf-8") as f:
        geojson = json.load(f)

    # Extraire les propriétés de chaque feature
    lieux = []
    for feature in geojson["features"]:
        props = feature["properties"]

        if ("bureaux" not in props):
            props["bureaux"] = set()
            props["bureaux"].add(props["bureau"])

        lieux.append({
            "adresse": props["adresse"],
            "bureaux": list(props["bureaux"]),
            "geo_point_2d": props["geo_point_2d"],
            "geo_shape": feature["geometry"]
        })

    # Trouver les bureaux avec suffixes dans les résultats
    with open(fichier_resultats, encoding="utf-8") as f:
        resultats = json.load(f)

    bureaux_avec_suffixe = []
    for bureau in resultats:
        bureau_id = bureau["column_7"]
        if re.search(r"[A-Z]$", bureau_id):
            bureaux_avec_suffixe.append(bureau_id)

    # Ajouter les bureaux suffixés à leur lieu de vote parent
    for bureau_suffixe in bureaux_avec_suffixe:
        parent = re.sub(r"[A-Z]$", "", bureau_suffixe)
        # Chercher le parent dans les 3 chiffres (format geo)
        parent_3 = parent.lstrip("0") if len(parent) > 3 else parent
        parent_3 = parent_3.zfill(3)

        trouve = False
        for lieu in lieux:
            if parent_3 in lieu["bureaux"]:
                # Stocker en 4 chars pour que ajouterUnZeroSiNescessaire le passe tel quel
                lieu["bureaux"].append(bureau_suffixe)
                trouve = True
                break

        if not trouve:
            print(
                f"  Attention : pas de lieu trouvé pour le bureau {bureau_suffixe} (parent: {parent_3})")

    with open(fichier_sortie, "w", encoding="utf-8") as f:
        json.dump(lieux, f, ensure_ascii=False)

    print(f"Géométrie : {len(lieux)} lieux de vote -> {fichier_sortie}")
    if bureaux_avec_suffixe:
        print(
            f"  {len(bureaux_avec_suffixe)} bureaux avec suffixe ajoutés : {', '.join(bureaux_avec_suffixe)}")


def main():
    fichier_resultats = None
    fichier_geo = None

    # Permettre de passer des fichiers en argument
    if len(sys.argv) >= 2:
        fichier_resultats = sys.argv[1]
    else:
        print("Usage: python convert.py <fichier_resultats> <fichier_geo>")
        exit()

    if len(sys.argv) >= 3:
        fichier_geo = sys.argv[2]

    convertir_resultats(fichier_resultats, fichier_resultats + ".out.json")

    if fichier_geo and os.path.exists(fichier_geo):
        convertir_geometrie(fichier_geo, fichier_resultats,
                            fichier_geo + ".out.json")
    else:
        print(f"Attention : fichier de géométrie introuvable : {fichier_geo}")
        print("  La conversion de la géométrie a été ignorée.")


if __name__ == "__main__":
    main()
