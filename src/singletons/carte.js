class Carte extends maplibregl.Map {
  constructor() {
    const protocol = new pmtiles.Protocol({ metadata: true })
    maplibregl.addProtocol('pmtiles', protocol.tile)

    super({
      container: 'map',
      style: 'https://static.ppsfleet.navy/osm-data/styles/generic-latest.json',
      center: [1.4436, 43.6042],
      zoom: 12,
    })

    this.addControl(new maplibregl.NavigationControl(), 'bottom-left')
  }
}

const carte = new Carte()
export default carte
