module.exports = {
    name: 'help',
    description: 'Display available commands or command info',
    aliases: ['h', 'menu', 'commands'],
    usage: '{prefix}help [command] | {prefix}help category:[category]',
    cooldown: 5,
    category: 'general',
    execute: async (terra, msg, args, context = {}) => {
        const { prefix } = terra.config

        // Default labels
        const labels = {
            commands: {},
            messages: {
                header: '*🤖 TerraBot Command Center*',
                footer: '✨ Use *{prefix}help <command>* for detailed info on any command.',
                notFound:
                    '❌ Command *{command}* not found. Try *{prefix}help*.',
                ownerOnly: '👑 Owner-only command',
                groupOnly: '👥 Group-only command',
                privateOnly: '💌 Private chat only command',
                examples: '💡 Examples:',
                stats: '*🔎 {totalCommands}* commands across *{categories}* categories',
            },
        }

        // Initialize or merge custom labels
        terra.helpLabels = terra.helpLabels || labels
        const getLabel = (key, vars = {}) => {
            let txt =
                terra.helpLabels.messages[key] || labels.messages[key] || ''
            Object.entries(vars).forEach(([k, v]) => {
                txt = txt.replace(new RegExp(`\{${k}\}`, 'g'), v)
            })
            return txt
        }

        // Route based on commands
        if (args.length && args[0].startsWith('command:')) {
            // TODO: show command help individually
            return showCommandDetails(args[0].slice(8).toLowerCase())
        }

        // Route based on args
        if (args.length && args[0].startsWith('category:')) {
            return showCategoryCommands(args[0].slice(9).toLowerCase())
        }
        if (!args.length) {
            return showAllCommands()
        }
        return showCommandDetails(args[0].toLowerCase())

        // Show all commands via native list menu
        async function showAllCommands() {
            // Group commands by category
            const categories = {}
            let total = 0
            const seen = new Set()
            for (const [_, cmd] of terra.commandHandler.commands.entries()) {
                if (seen.has(cmd.name)) continue
                seen.add(cmd.name)
                total++
                const cat = (cmd.category || 'uncategorized').toLowerCase()
                if (!categories[cat]) categories[cat] = []
                categories[cat].push(cmd)
            }

            // Build rows for the list
            const rows = []
            for (const [cat, cmds] of Object.entries(categories)) {
                const headerText = `${getCategoryEmoji(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`
                cmds.forEach((cmd) => {
                    rows.push({
                        header: headerText,
                        title: `${prefix}${cmd.name}`,
                        description: cmd.description || 'No description',
                        id: `help command:${cmd.name}`,
                    })
                })
            }

            const fallbackText = [
                '*🤖 TerraBot Command Center*',
                ...Object.entries(categories).map(([cat, cmds]) => {
                    const emoji = getCategoryEmoji(cat)
                    const catTitle = `${emoji} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`
                    const cmdLines = cmds.map(
                        (cmd) =>
                            `  • *${prefix}${cmd.name}* - ${cmd.description || 'No description'}`
                    )
                    return [`\n━━━━━ *${catTitle}* ━━━━━`, ...cmdLines].join('\n')
                }),
            ].join('\n')

            const sections = Object.entries(categories).map(([cat, cmds]) => {
                return {
                    title: cat,
                    highlight_label: `${cat.toUpperCase()} Commands`,
                    rows: cmds.map((cmd) => ({
                        header: cat,
                        title: `${prefix}${cmd.name}`,
                        description: cmd.description || 'No description',
                        id: `${cmd.name}`,
                    })),
                }
            })

            // Build the buttons payload with nativeFlowInfo
            const payload = {
                text: fallbackText,
                buttons: [
                    {
                        buttonId: 'action',
                        buttonText: { displayText: getLabel('header') },
                        type: 4,
                        nativeFlowInfo: {
                            name: 'single_select',
                            paramsJson: JSON.stringify({
                                title: 'Pilih~',
                                sections,
                            }),
                        },
                    },
                ],
                footer: getLabel('footer', { prefix }),
                headerType: 1,
            }

            return terra.socket.sendMessage(msg.key.remoteJid, payload, {
                quoted: msg,
            })
        }

        // Fallback: show commands by category in text
        async function showCategoryCommands(category) {
            const cmds = Array.from(terra.commandHandler.commands.values())
                .filter(
                    (c) =>
                        (c.category || 'uncategorized').toLowerCase() ===
                        category
                )
                .filter(
                    (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i
                )

            if (!cmds.length) {
                return terra.reply(
                    msg,
                    `❌ No commands found in category *${category}*`
                )
            }
            let text = `*📂 ${category.charAt(0).toUpperCase() + category.slice(1)} Commands*\n\n`
            cmds.forEach((c) => {
                const badges = []
                if (c.ownerOnly) badges.push('👑')
                if (c.groupOnly) badges.push('👥')
                if (c.privateOnly) badges.push('💌')
                text += `• *${prefix}${c.name}* ${badges.join('')}\n  ↳ ${c.description}\n\n`
            })
            text += getLabel('footer', { prefix })
            return terra.reply(msg, text)
        }

        // Show detailed command info in text
        async function showCommandDetails(name) {
            const cmd = terra.commandHandler.getCommand(name)
            if (!cmd) {
                return terra.reply(
                    msg,
                    getLabel('notFound', { command: name, prefix })
                )
            }
            const badges = []
            if (cmd.ownerOnly) badges.push(getLabel('ownerOnly'))
            if (cmd.groupOnly) badges.push(getLabel('groupOnly'))
            if (cmd.privateOnly) badges.push(getLabel('privateOnly'))

            let text = `*${getCategoryEmoji(cmd.category)} Command: ${prefix}${cmd.name}*\n\n`
            text += `*Description:* ${cmd.description}\n\n`
            if (badges.length) text += `*Notes:* ${badges.join(', ')}\n\n`
            if (cmd.aliases?.length)
                text += `*Aliases:* ${cmd.aliases.join(', ')}\n\n`
            if (cmd.usage)
                text += `*Usage:* ${cmd.usage.replace('{prefix}', prefix)}\n\n`
            if (cmd.examples?.length) {
                text += `${getLabel('examples')}\n`
                cmd.examples.forEach(
                    (ex) => (text += `  • ${ex.replace('{prefix}', prefix)}\n`)
                )
                text += `\n`
            }
            if (cmd.cooldown) text += `*Cooldown:* ${cmd.cooldown}s\n\n`
            text += `*Category:* ${cmd.category}`

            return terra.reply(msg, text)
        }

        // Helper: category emoji
        function getCategoryEmoji(category) {
            const map = {
                general: '🔧',
                media: '🎬',
                fun: '🎮',
                utility: '🛠️',
                admin: '⚙️',
                owner: '👑',
                uncategorized: '📝',
                sticker: '🖼️',
                group: '👥',
                download: '📥',
                info: 'ℹ️',
                game: '🎲',
            }
            return map[category?.toLowerCase()] || '📌'
        }
    },
}
