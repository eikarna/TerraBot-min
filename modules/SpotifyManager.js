class SpotifyManager {
    constructor(terra) {
        this.name = 'spotify'
        this.terra = terra
        this.logger = this.terra.logger.child({ name: 'SpotifyManager' })
    }

    async fetch(link) {
        const data = await this.terra.modulesManager
            .get('api')
            .get(`https://api.siputzx.my.id/api/d/spotify?url=${link}`)

        if (!data) {
            this.logger.error('No data found')
            return null
        }

        if (!data?.status) {
            this.logger.error('Response status is not true, it mean there is an error on API server')
            return null
        }

        this.logger.info(JSON.stringify(data, null, 4))

        return data

        /* return {
            title: data.data.title,
            artist: data.data.artis,
            duration: data.data.durasi,
            image: data.data.image,
            download: data.data.download,
        }*/
    }
}

module.exports = SpotifyManager
