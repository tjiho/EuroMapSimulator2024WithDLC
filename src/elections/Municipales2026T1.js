import { Election } from './Election.js'

const couleurs = {
  'VIVRE MIEUX LA GAUCHE UNIE, ÉCOLOGISTE, CITOYENNE ET SOLIDAIRE': '#0ee534',
  'NPA RÉVOLUTIONNAIRES- TOULOUSE OUVRIÉRE ET RÉVOLUTIONNAIRE': '#bb1414',
  'LUTTE OUVRIÈRE - LE CAMPS DES TRAVAILLEURS': '#E32831',
  'TOULOUSE POUR LES JEUNES, LES TRAVAILLEURS ET LES SERVICES PUBLICS, CONTRE LES BUDGETS DE GUERRE': '#C62828',
  "AVEC JEAN-LUC MOUDENC, PROTEGEONS L'AVENIR DE TOULOUSE": '#340ee5',
  'LE BON SENS TOULOUSAIN': '#7A5230',
  'A LA RECONQUETE ! DE TOULOUSE': '#6B4226',
  'NOUVEL AIR': '#FF8C00',
  'DEMAIN TOULOUSE À GAUCHE ET ÉCOLOGISTE': '#e50e54',
  'UNE TRAVAILLEUSE AU CAPITOLE': '#cc2222',
}

export default new Election({
  nom: 'Municipales 2026 1er tour',
  fichierResultats: '/data/municipales-2026-resultats.json',
  fichierGeometrie: '/data/election-2026-lieux-de-vote.json',
  couleurs,
})
