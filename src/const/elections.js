import {
  couleursMunicipales2026,
  couleursEuropeennes2024,
  couleursMunicipales2026SecondTour,
} from "./couleurs.js";

export const elections = {
  "Municipales 2026 1er tour": {
    fichierResultats: "/data/municipales-2026-resultats.json",
    fichierGeometrie: "/data/election-2026-lieux-de-vote.json",
    couleurs: couleursMunicipales2026,
    nomDesListes: Object.keys(couleursMunicipales2026),
  },
  "Européennes 2024": {
    fichierResultats: "/data/euro-2024-resultats.json",
    fichierGeometrie: "/data/elections-2024-lieux-de-vote.json",
    couleurs: couleursEuropeennes2024,
    nomDesListes: Object.keys(couleursEuropeennes2024),
  },
  "Municipales 2026 2nd tour": {
    fichierResultats: "/data/municipales-2026-resultats-2nd-tour.json",
    fichierGeometrie: "/data/election-2026-lieux-de-vote.json",
    couleurs: couleursMunicipales2026SecondTour,
    nomDesListes: Object.keys(couleursMunicipales2026SecondTour),
  },
};
