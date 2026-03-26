#!/usr/bin/env python3
"""
Script de conversion des données électorales brutes vers le format attendu par la carte.

Convertit :
- Les résultats (JSON avec colonnes alternées code/votes) → format column_20, column_22, etc.
- La géométrie (GeoJSON FeatureCollection) → tableau JSON simple
"""

import argparse
import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

# Fichiers d'entrée (par défaut)
# INPUT_RESULTATS = os.path.join(PROJECT_DIR, "resultats-elections-municipales-2026-1er-tour.json")
# INPUT_GEO = os.path.join(PROJECT_DIR, "elections-2024-lieux-de-vote.geojson")

# Colonnes paires contenant les votes (18, 20, 22, ..., 36)


def convertir_resultats(fichier_entree, fichier_sortie, col_inscrits=9):
    """Convertit les résultats du format brut vers le format attendu par index.html."""
    with open(fichier_entree, encoding="utf-8") as f:
        donnees = json.load(f)

    col_votants = col_inscrits + 2
    col_blanc = col_inscrits + 4
    col_nul = col_inscrits + 5
    col_debut_votes = col_inscrits + 9

    resultats = []
    for bureau in donnees:
        record = {"column_7": bureau["column_7"], "inscrits": bureau[f"column_{col_inscrits}"],
                  "votants": bureau[f"column_{col_votants}"], "blanc": bureau[f"column_{col_blanc}"], "nul": bureau[f"column_{col_nul}"]}
        for i, col_source in enumerate(range(col_debut_votes, len(donnees[0])+1, 2)):
            col_cible = 18 + i * 2  # column_18, column_20, column_22, ..., column_38
            record[f"column_{col_cible}"] = bureau[f"column_{col_source}"]
        resultats.append(record)

    with open(fichier_sortie, "w", encoding="utf-8") as f:
        json.dump(resultats, f, ensure_ascii=False)

    print(f"Résultats : {len(resultats)} bureaux -> {fichier_sortie}")


def convertir_geometrie(fichier_geo, fichier_resultats, fichier_sortie, cle_bureau="bureau"):
    """Convertit le GeoJSON en tableau simple et ajoute les bureaux avec suffixes."""
    with open(fichier_geo, encoding="utf-8") as f:
        geojson = json.load(f)

    # Extraire les propriétés de chaque feature
    lieux = []
    for feature in geojson["features"]:
        props = feature["properties"]

        if ("bureaux" not in props):
            props["bureaux"] = set()
            props["bureaux"].add(props[cle_bureau])

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

    # Bureaux déjà présents comme feature propre dans la géométrie
    bureaux_existants = set()
    for lieu in lieux:
        for b in lieu["bureaux"]:
            bureaux_existants.add(b)

    # Ajouter les bureaux suffixés à leur lieu de vote parent (sauf si déjà présent)
    for bureau_suffixe in bureaux_avec_suffixe:
        suffixe_lettre = bureau_suffixe[-1]
        parent_num = bureau_suffixe[:-1]
        normalise = parent_num.lstrip("0").zfill(3) + suffixe_lettre

        if normalise in bureaux_existants:
            continue

        parent = re.sub(r"[A-Z]$", "", bureau_suffixe)
        parent_3 = parent.lstrip("0") if len(parent) > 3 else parent
        parent_3 = parent_3.zfill(3)

        trouve = False
        for lieu in lieux:
            if parent_3 in lieu["bureaux"]:
                lieu["bureaux"].append(normalise)
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
    parser = argparse.ArgumentParser(description="Conversion des données électorales brutes vers le format carte.")
    parser.add_argument("fichier_resultats", help="Fichier JSON des résultats")
    parser.add_argument("fichier_geo", nargs="?", help="Fichier GeoJSON des lieux de vote")
    parser.add_argument("-i", "--inscrits", type=int, default=9, help="Numéro de la colonne 'inscrits' (défaut: 9)")
    parser.add_argument("-b", "--cle-bureau", default="bureau", help="Nom de la clé pour le bureau dans le GeoJSON (défaut: bureau)")
    args = parser.parse_args()

    convertir_resultats(args.fichier_resultats, args.fichier_resultats + ".out.json", args.inscrits)

    if args.fichier_geo and os.path.exists(args.fichier_geo):
        convertir_geometrie(args.fichier_geo, args.fichier_resultats,
                            args.fichier_geo + ".out.json", args.cle_bureau)
    elif args.fichier_geo:
        print(f"Attention : fichier de géométrie introuvable : {args.fichier_geo}")
        print("  La conversion de la géométrie a été ignorée.")


if __name__ == "__main__":
    main()
