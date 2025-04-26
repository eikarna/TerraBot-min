module.exports = {
    name: 'ping',
    description: 'Check bot response time',
    aliases: ['p'],
    cooldown: 5,
    category: 'general',
    execute: async (terra, msg, args) => {
        const start = Date.now()
        const pingTime = Date.now() - start

        return terra.reply(msg, `🏓 Pong! Response time: ${pingTime}ms`)
    },
}
