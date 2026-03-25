import carte from './singletons/carte.js'
import { electionsParNom, chargerToutesLesElections } from './elections/index.js'
import { surChangementElection, surChangementMode, electionParDefaut, modeParDefaut } from './composants/selecteurs.js'
import { masquerPanneau, afficherPanneau } from './composants/panneau.js'
import { creerToutesLesZones, supprimerToutesLesZones } from './visualisations/zone.js'
import { creerMarqueurCamembert, creerMarqueurPoint, creerMarqueurMelange } from './visualisations/marqueurs.js'

let marqueurs = []
let electionActuelle = electionParDefaut()
let modeActuel = modeParDefaut()

function chargerEtAfficher() {
  supprimerLesMarqueurs()
  const election = electionsParNom[electionActuelle]
  afficherLesDonnees(election, modeActuel)
}

function supprimerLesMarqueurs() {
  for (const m of marqueurs) m.remove()
  marqueurs = []
  supprimerToutesLesZones()
}

function afficherLesDonnees(election, mode) {
  if (mode === 'zone') {
    creerToutesLesZones(election)
    return
  }

  for (const bureau of Object.values(election.donnees)) {
    if (!bureau.geometrie) continue
    try {
      const creerMarqueur = mode === 'point'
        ? creerMarqueurPoint
        : mode === 'melange'
          ? creerMarqueurMelange
          : creerMarqueurCamembert

      const element = creerMarqueur(bureau.resultats, election.couleurs)

      element.addEventListener('click', (e) => {
        e.stopPropagation()
        afficherPanneau(bureau.nom, electionActuelle)
      })

      const marqueur = new maplibregl.Marker({ element })
        .setLngLat(bureau.geometrie)
        .addTo(carte)
      marqueurs.push(marqueur)
    } catch (error) {
      console.warn('Marqueur ignoré :', error)
    }
  }
}

let derniereTaille = 0
function mettreAJourTailleMarqueurs() {
  const zoom = carte.getZoom()
  const zoomBorne = Math.max(12, Math.min(15, zoom))
  const taille = Math.round(16 + ((zoomBorne - 12) * (50 - 16)) / 3)
  if (taille === derniereTaille) return
  derniereTaille = taille
  document.documentElement.style.setProperty('--taille-marqueur', taille + 'px')
}

const carteChargee = new Promise(resolve => carte.on('load', resolve))

Promise.all([chargerToutesLesElections(), carteChargee]).then(() => {
  document.getElementById('chargement').remove()
  mettreAJourTailleMarqueurs()
  chargerEtAfficher()
})

carte.on('zoom', mettreAJourTailleMarqueurs)
carte.on('click', masquerPanneau)

surChangementElection((nom) => {
  electionActuelle = nom
  chargerEtAfficher()
})

surChangementMode((mode) => {
  modeActuel = mode
  chargerEtAfficher()
})
