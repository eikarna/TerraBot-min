module.exports = {
    // TODO: set profile name
    name: 'setname',
    description: 'Set bot profile name',
    aliases: ['setname'],
    usage: '[prefix]setname [value]',
    ownerOnly: true,
    category: 'owner',
    execute: async (terra, msg, args, context) => {
        try {
            const raw =
                msg.message.extendedTextMessage?.text ??
                msg.message.conversation ??
                ''

            // negro

            const prefix = context.prefix
            const cmdLen = prefix.length + context.command.length + 1
            let name = raw.slice(cmdLen)

            if (!name) {
                return terra.reply(msg, '⚠️ Masukkan nama!')
            }

            await context.conn.updateProfileName(name)

            return terra.reply(msg, `Success mengubah nama menjadi "${name}!"`)
        } catch (err) {
            return terra.reply(msg, `⚠️ Error mengubah nama: ${err}`)
        }
    },
}
