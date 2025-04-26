const axios = require('axios')

class ApiManager {
    constructor(terra) {
        this.name = 'api'
        this.terra = terra
        this.logger = this.terra.logger.child({ name: 'ApiManager' })
        this.axios = axios.create({
            timeout: 10000,
            headers: {
                'User-Agent': this.terra.config.userAgent,
            },
        })
    }

    async get(url, options = {}) {
        try {
            const response = await this.axios.get(url, options)
            return response.data
        } catch (error) {
            this.logger.error(`API Request failed: ${error.message}`)
            throw error
        }
    }

    async post(url, data, options = {}) {
        try {
            const response = await this.axios.post(url, data, options)
            return response.data
        } catch (error) {
            this.logger.error(`API Request failed: ${error.message}`)
            throw error
        }
    }
}

module.exports = ApiManager
