import { creerMarqueurCamembert, creerMarqueurPoint } from './marqueurs.js'
import { afficherPanneau } from './panneau.js'

let marqueurs = []
const cache = {}

export async function chargerElection(map, election, mode = 'camembert') {
    supprimerLesMarqueurs()

    const cle = election.fichierResultats
    if (!cache[cle]) {
        const [donnees, donneesGeometrique] = await Promise.all([
            recupererJson(election.fichierResultats),
            recupererJson(election.fichierGeometrie)
        ])
        const indexParBureauDeVote = indexerParBureauDeVote(donnees, election)
        augmenterLesResultatsAvecLesDonneesGeometrique(indexParBureauDeVote, donneesGeometrique)
        cache[cle] = fusionnerParCoordonnees(indexParBureauDeVote)
    }

    afficherLesDonnees(map, cache[cle], election, mode)
}

export function supprimerLesMarqueurs() {
    for (const marqueur of marqueurs) {
        marqueur.remove()
    }
    marqueurs = []
}

async function recupererJson(url) {
    const res = await fetch(url)
    return await res.json()
}

function indexerParBureauDeVote(donneesDesBureauxDeVote, election) {
    const bureauxDeVote = {}
    for (const bureauDeVote of donneesDesBureauxDeVote) {
        bureauxDeVote[bureauDeVote["column_7"]] = {
            resultats: traiterLesResultatsParListe(bureauDeVote, election)
        }
    }
    return bureauxDeVote
}

// Les colonnes du CSV : les voix du candidat i sont dans column_(i*2 + 20)
function traiterLesResultatsParListe(donneesDUnBureau, election) {
    const resultats = {}
    for (let i = 0; i < election.nomDesListes.length; i += 1) {
        const nomDeLaListe = election.nomDesListes[i]
        const nombreDeVoix = donneesDUnBureau[`column_${i * 2 + 20}`]
        resultats[nomDeLaListe] = nombreDeVoix
    }
    return Object.entries(resultats).sort((a, b) => b[1] - a[1])
}

function augmenterLesResultatsAvecLesDonneesGeometrique(resultats, geometrie) {
    for (const lieu of geometrie) {
        for (const nomDeBureauDeVote of lieu['bureaux']) {
            const cle = padBureauDeVote(nomDeBureauDeVote)
            if (resultats[cle]) {
                resultats[cle]['geometrie'] = lieu['geo_point_2d']
            }
        }
    }
}

function padBureauDeVote(nom) {
    return nom.length === 3 ? "0" + nom : nom
}

function fusionnerParCoordonnees(indexParBureauDeVote) {
    const indexFusionne = {}
    for (const [nomDeBureauDeVote, donneesDuBureauDeVote] of Object.entries(indexParBureauDeVote)) {
        const geo = donneesDuBureauDeVote['geometrie']
        const cle = geo ? `${geo['lon']}-${geo['lat']}` : "0-0"
        if (!indexFusionne[cle]) {
            indexFusionne[cle] = { coordonnees: geo, bureaux: {} }
        }
        indexFusionne[cle].bureaux[nomDeBureauDeVote] = donneesDuBureauDeVote
    }
    return indexFusionne
}

function agregerLesVoix(bureaux) {
    const totaux = {}
    for (const donnees of Object.values(bureaux)) {
        for (const [liste, voix] of donnees.resultats) {
            totaux[liste] = (totaux[liste] || 0) + voix
        }
    }
    return Object.entries(totaux).sort((a, b) => b[1] - a[1])
}

function afficherLesDonnees(map, indexFusionneParCoordonnees, election, mode) {
    const creerMarqueur = mode === 'point' ? creerMarqueurPoint : creerMarqueurCamembert

    for (const { coordonnees, bureaux } of Object.values(indexFusionneParCoordonnees)) {
        try {
            const resultatsAgreges = agregerLesVoix(bureaux)
            const element = creerMarqueur(resultatsAgreges, election.couleurs)

            element.addEventListener('click', (e) => {
                e.stopPropagation()
                afficherPanneau(bureaux, election.couleurs)
            })

            const marqueur = new maplibregl.Marker({ element })
                .setLngLat(coordonnees)
                .addTo(map)
            marqueurs.push(marqueur)
        } catch (error) {
            console.warn("Marqueur ignoré :", error)
        }
    }
}
