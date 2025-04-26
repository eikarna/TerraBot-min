module.exports = {
    name: 'spotify',
    description: 'Download song from Spotify with url',
    aliases: ['spot', 'sp', 'spotdl'],
    usage: '{prefix}spotify [song, s|playlist, p] [link]',
    cooldown: 5,
    category: 'download',
    execute: async (terra, msg, args, context) => {
        if (!args[0] || !args[1])
            return terra.reply(msg, 'Please provide a type and Spotify link!')

        const type = args[0].toLowerCase()

        if (type.includes('song') || type === 's') {
            const url = args[1]
            if (!url.startsWith('https://open.spotify.com/'))
                return terra.reply(msg, 'Please provide a valid Spotify link!')

            try {
                const spotify = await terra.modulesManager.get('spotify').fetch(url)
                if (!spotify)
                    return terra.reply(msg, 'Could not find song on Spotify!')

                // terra.logger.info(JSON.stringify(spotify, null, 4))

                return terra.sendAudio(context.chatJid, spotify?.download, false, {
                    contextInfo: {
                        isForwarding: true,
                        forwardingScore: 999,
                        mentionedJid: [msg.key.participant],
                        stanzaId: msg.key.id,
                        externalAdReply: {
                            title: spotify?.title,
                            body: spotify?.artist,
                            mediaType: 1,
                            showAdAttribution: true,
                            renderLargerThumbnail: true,
                            thumbnailUrl: spotify?.image,
                            sourceUrl: spotify?.download,
                        },
                    },
                })

                // terra.modules.get('download').download(song, msg, context)
            } catch (e) {
                console.error(e)
                return terra.reply(msg,
                    `An error occurred while trying to download the song! ${e}`
                )
            }
        } else {
            return terra.reply(
                msg,
                'Sorry, playlist download currently not supported1 :('
            )
        }
    },
}
