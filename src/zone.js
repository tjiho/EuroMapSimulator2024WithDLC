export function creerZone(map, couleurs, shape, bureau, nomBureau) {
    //console.log(bureau.resultats)
    const couleur = couleurs[bureau.resultats[0][0]]

    map.addSource(nomBureau, {
        'type': 'geojson',
        'data': shape,
    })

    map.addLayer({
        'id': nomBureau+'-fill',
        'type': 'fill',
        'source': nomBureau,
        'paint': {
            'fill-color': couleur,
            'fill-opacity': 0.3
        }
    })

    map.addLayer({
        'id': nomBureau+'shape',
        'type': 'line',
        'source': nomBureau,
        'paint': {
            'line-color': '#000',
            'line-width': 1
        }
    })
}