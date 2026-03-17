import { couleursMunicipales2026, couleursEuropeennes2024 } from './couleurs.js'

export const elections = {
    "Municipales 2026": {
        fichierResultats: "/data/municipales-2026-resultats.json",
        fichierGeometrie: "/data/election-2026-lieux-de-vote.json",
        couleurs: couleursMunicipales2026,
        nomDesListes: Object.keys(couleursMunicipales2026)
    },
    "Européennes 2024": {
        fichierResultats: "/data/euro-2024-resultats.json",
        fichierGeometrie: "/data/elections-2024-lieux-de-vote.json",
        couleurs: couleursEuropeennes2024,
        nomDesListes: Object.keys(couleursEuropeennes2024)
    }
}
