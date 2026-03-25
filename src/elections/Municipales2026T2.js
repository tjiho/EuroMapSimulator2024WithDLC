import { Election } from "./Election.js";
import { COULEUR_AUTRES } from "../outils/couleurs.js";

const couleurs = {
  "Avec Jean-Luc MOUDENC, Protégeons l'Avenir de Toulouse": "#340ee5",
  "Demain Toulouse La Gauche Unie": "#bb1414",
};

class Municipales2026SecondTour extends Election {
  couleurDuBureau(resultats) {
    if (!resultats || resultats.length < 2)
      return super.couleurDuBureau(resultats);
    const total = resultats.reduce((s, r) => s + r[1], 0);
    if (total === 0) return COULEUR_AUTRES;
    const ecart = (resultats[0][1] - resultats[1][1]) / total;
    if (ecart < 0.03) return COULEUR_AUTRES;
    return this.couleurs[resultats[0][0]] || COULEUR_AUTRES;
  }

  opaciteDuBureau(resultats) {
    if (this.couleurDuBureau(resultats) === COULEUR_AUTRES) {
      return 0.8;
    }
    const total = resultats.reduce((s, r) => s + r[1], 0);
    const ecart = (resultats[0][1] - resultats[1][1]) / total;
    return Math.min(1, 0.15 + ((ecart - 0.05) / 0.45) * 0.85);
  }
}

export default new Municipales2026SecondTour({
  nom: "Municipales 2026 2nd tour",
  fichierResultats: "/data/municipales-2026-resultats-2nd-tour.json",
  fichierGeometrie: "/data/election-2026-lieux-de-vote.json",
  couleurs,
});
