import { COULEUR_AUTRES, hexVersRgb, rgbVersHex } from '../outils/couleurs.js'

export function creerMarqueurCamembert(resultatsAgreges, couleurs) {
  const total = resultatsAgreges.reduce((s, r) => s + r[1], 0)
  if (total === 0) return creerMarqueurPoint(resultatsAgreges, couleurs)

  const div = document.createElement('div')
  div.className = 'marqueur-camembert'

  const top4 = resultatsAgreges.slice(0, 4)
  const autresVoix = resultatsAgreges.slice(4).reduce((s, r) => s + r[1], 0)

  const tranches = top4.map(([nom, voix]) => ({
    fraction: voix / total,
    couleur: couleurs[nom] || COULEUR_AUTRES,
  }))
  if (autresVoix > 0) {
    tranches.push({ fraction: autresVoix / total, couleur: COULEUR_AUTRES })
  }

  if (tranches[0].fraction >= 0.995) {
    div.innerHTML = `<svg viewBox="-1 -1 2 2">
      <circle cx="0" cy="0" r="1" fill="${tranches[0].couleur}" />
    </svg>`
    return div
  }

  let paths = ''
  let angle = -Math.PI / 2
  for (const tranche of tranches) {
    const delta = tranche.fraction * 2 * Math.PI
    const x1 = Math.cos(angle)
    const y1 = Math.sin(angle)
    const x2 = Math.cos(angle + delta)
    const y2 = Math.sin(angle + delta)
    const largeArc = delta > Math.PI ? 1 : 0
    paths += `<path d="M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${tranche.couleur}" />`
    angle += delta
  }

  div.innerHTML = `<svg viewBox="-1 -1 2 2">${paths}</svg>`
  return div
}

export function creerMarqueurPoint(resultatsAgreges, couleurs) {
  const div = document.createElement('div')
  div.className = 'marqueur-point'
  div.style.backgroundColor = resultatsAgreges.length > 0
    ? (couleurs[resultatsAgreges[0][0]] || COULEUR_AUTRES)
    : COULEUR_AUTRES
  return div
}

export function creerMarqueurMelange(resultatsAgreges, couleurs) {
  const div = document.createElement('div')
  div.className = 'marqueur-point'

  const top3 = resultatsAgreges.slice(0, 3)
  const totalTop3 = top3.reduce((s, r) => s + r[1], 0)

  if (totalTop3 === 0) {
    div.style.backgroundColor = COULEUR_AUTRES
    return div
  }

  const poidsCarres = top3.map(([, voix]) => (voix / totalTop3) ** 2)
  const totalPoidsCarres = poidsCarres.reduce((s, p) => s + p, 0)

  let r = 0, g = 0, b = 0
  top3.forEach(([nom], i) => {
    const poids = poidsCarres[i] / totalPoidsCarres
    const [cr, cg, cb] = hexVersRgb(couleurs[nom] || COULEUR_AUTRES)
    r += cr * poids
    g += cg * poids
    b += cb * poids
  })

  div.style.backgroundColor = rgbVersHex(r, g, b)
  return div
}
