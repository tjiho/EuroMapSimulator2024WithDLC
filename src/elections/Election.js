import { centroide, padBureauDeVote } from '../outils/geometrie.js'
import { COULEUR_AUTRES } from '../outils/couleurs.js'

export class Election {
  constructor({ nom, fichierResultats, fichierGeometrie, couleurs, nomDesListes }) {
    this.nom = nom
    this.fichierResultats = fichierResultats
    this.fichierGeometrie = fichierGeometrie
    this.couleurs = couleurs
    this.nomDesListes = nomDesListes ?? Object.keys(couleurs)
  }

  traiterLesResultatsParListe(donneesDUnBureau) {
    const resultats = {}
    for (let i = 0; i < this.nomDesListes.length; i++) {
      const nomDeLaListe = this.nomDesListes[i]
      const nombreDeVoix = donneesDUnBureau[`column_${i * 2 + 18}`]
      resultats[nomDeLaListe] = nombreDeVoix
    }
    return Object.entries(resultats).sort((a, b) => b[1] - a[1])
  }

  indexerParBureauDeVote(donneesDesBureauxDeVote) {
    const bureauxDeVote = {}
    for (const bureauDeVote of donneesDesBureauxDeVote) {
      bureauxDeVote[bureauDeVote['column_7']] = {
        resultats: this.traiterLesResultatsParListe(bureauDeVote),
        inscrits: bureauDeVote['inscrits'],
        votants: bureauDeVote['votants'],
        blanc: bureauDeVote['blanc'],
        nul: bureauDeVote['nul']
      }
    }
    return bureauxDeVote
  }

  augmenterAvecGeometrie(resultats, geometrie) {
    for (const lieu of geometrie) {
      const centre = lieu.geo_shape ? centroide(lieu.geo_shape) : lieu.geo_point_2d
      const noms = lieu.bureaux
        ? lieu.bureaux.map(padBureauDeVote)
        : [padBureauDeVote(lieu.bureau)]

      for (const cle of noms) {
        if (resultats[cle]) {
          resultats[cle].geometrie = centre
          resultats[cle].shape = lieu.geo_shape
        }
      }
    }
  }

  couleurDuBureau(resultats) {
    if (!resultats || resultats.length === 0) return COULEUR_AUTRES
    return this.couleurs[resultats[0][0]] || COULEUR_AUTRES
  }

  opaciteDuBureau(resultats) {
    if (!resultats || resultats.length === 0) return 0.3
    const totalVoix = resultats.reduce((total, r) => total + r[1], 0)
    return totalVoix > 0 ? resultats[0][1] / totalVoix : 0.3
  }
}
