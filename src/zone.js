export function creerZone(map, couleurs, shape, bureau, nomBureau, click) {
    const couleur = couleurs[bureau.resultats[0][0]]
    const totalVoix = bureau.resultats.reduce((total, res) => total + res[1], 0)
    const basePercentage = bureau.resultats[0][1] / totalVoix

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
            'fill-opacity': basePercentage
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

    map.on('mouseenter', nomBureau+'-fill', () => {
        map.setPaintProperty(nomBureau+'-fill', 'fill-opacity', 1)
    });

    map.on('mouseleave', nomBureau+'-fill', () => {
        map.setPaintProperty(nomBureau+'-fill', 'fill-opacity', basePercentage)
    });

    map.on('click', nomBureau+'-fill', click);
}