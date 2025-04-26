const cp = require('child_process')
const { promisify } = require('util')
const exec = promisify(cp.exec).bind(cp)

module.exports = {
    name: 'exec',
    description: 'execute a code',
    aliases: ['$'],
    usage: '[prefix]exec [value]',
    ownerOnly: true,
    category: 'owner',
    execute: async (terra, msg, args, context) => {
        // If no arguments, show current config
        if (!args.length) {
            return terra.reply(msg, 'Please provide a code!')
        }

        let m = await terra.sendMessage(context.chatJid, 'Executing...', {
            quoted: msg,
        })
        let o
        try {
            o = await exec(args.join(' '))
        } catch (e) {
            o = e
        } finally {
            let { stdout, stderr } = o
            if (stdout)
                terra.sendMessage(context.chatJid, {
                    text: stdout,
                    edit: m.key,
                })
            if (stderr)
                terra.sendMessage(context.chatJid, {
                    text: stderr,
                    edit: m.key,
                })
        }
    },
}
