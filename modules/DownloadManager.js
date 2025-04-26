const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)

class DownloadManager {
    constructor(terra) {
        this.name = 'download'
        this.terra = terra
        this.logger = this.terra.logger.child({ name: 'DownloadManager' })
    }

    async downloadFile(url, outputPath) {
        const response = await this.terra.modules.get('api').axios({
            url,
            method: 'GET',
            responseType: 'stream',
        })

        await pipeline(response.data, fs.createWriteStream(outputPath))

        return outputPath
    }

    async downloadMedia(message, mediaType = 'audio') {
        try {
            const buffer = await this.terra.downloadMediaMessage(message)
            const ext = mediaType === 'audio' ? 'mp3' : 'mp4'
            const filename = `${Date.now()}.${ext}`
            const filePath = path.join(__dirname, 'temp', filename)

            fs.writeFileSync(filePath, buffer)
            this.logger.info(`Media saved to ${filePath}`)
            return filePath
        } catch (error) {
            this.logger.error(`Error downloading media: ${error.message}`)
            throw error
        }
    }
}

module.exports = DownloadManager
