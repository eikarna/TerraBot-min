const fs = require('fs')
const path = require('path')

class ModuleManager {
    constructor(terra) {
        this.modules = new Map()
        this.terra = terra
        this.logger = this.terra.logger.child({ name: 'ModuleManager' })
    }

    async loadModules() {
        this.modules.clear()
        const modulesPath = path.join(__dirname)
        const moduleFiles = await fs
            .readdirSync(modulesPath)
            .filter((file) => file !== 'index.js' && file.endsWith('.js'))

        for (const file of moduleFiles) {
            const modulePath = path.join(modulesPath, file)
            const ModuleClass = require(modulePath)

            if (typeof ModuleClass === 'function') {
                const moduleInstance = new ModuleClass(this.terra)
                this.modules.set(moduleInstance.name, moduleInstance)

                if (typeof moduleInstance.initialize === 'function') {
                    moduleInstance.initialize()
                }
            }
            this.logger.info(`Loaded module: ${file}`)
        }
    }

    get(name) {
        return this.modules.get(name)
    }

    has(name) {
        return this.modules.has(name)
    }
}

module.exports = ModuleManager
