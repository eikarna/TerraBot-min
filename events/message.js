module.exports = {
    name: 'message',
    description: 'Handles incoming messages and command execution',
    execute: async (terra, msg) => {
        // Skip messages from self
        // if (!terra.config.privateMode && msg.key.fromMe) return;

        // Extract the text content if available
        let content = ''

        if (terra.config.debugMessage)
            terra.logger.debug(JSON.stringify(msg.message))

        if (msg.message?.conversation) {
            content = msg.message.conversation
        } else if (msg.message?.extendedTextMessage?.text) {
            content = msg.message.extendedTextMessage.text
        } else if (msg.message?.imageMessage?.caption) {
            content = msg.message.imageMessage.caption
        } else if (msg.message?.videoMessage?.caption) {
            content = msg.message.videoMessage.caption
        } else if (msg.message?.interactiveResponseMessage?.body) {
            content = msg.message.interactiveResponseMessage.body.text
        }

        if (content) {
            // Determine if this is a group message
            const sender = msg.key.remoteJid
            const isGroup = sender.endsWith('@g.us')
            const participantJid = msg.key.participant || sender

            // Get sender name safely with error handling
            let senderName
            try {
                senderName = await terra.getUserName(msg)
            } catch (error) {
                terra.logger.debug(`Couldn't get sender name: ${error.message}`)
                senderName = participantJid.split('@')[0]
            }

            // Log message
            terra.logger.info(
                `Message from ${senderName} ${isGroup ? '(group)' : '(private)'}: ${content}`
            )

            // Check permission if private mode is enabled
            if (terra.config.privateMode) {
                let hasPermission = false

                // Check if sender is an owner
                const isOwner = terra.config.owners.includes(
                    participantJid.split('@')[0]
                )

                // Check if sender is a group admin (if in a group)
                let isAdmin = false
                if (isGroup) {
                    try {
                        const groupMetadata =
                            await terra.groupManager.getGroupMetadata(sender)
                        const participant = groupMetadata.participants.find(
                            (p) => p.id === participantJid
                        )
                        isAdmin =
                            participant &&
                            ['admin', 'superadmin'].includes(participant.admin)
                    } catch (error) {
                        terra.logger.error(
                            `Error checking admin status: ${error.message}`
                        )
                    }
                }

                hasPermission = isOwner || isAdmin

                // If no permission and private mode enabled, ignore message
                if (!hasPermission) {
                    terra.logger.debug(
                        `Ignoring message from ${senderName} (private mode)`
                    )
                    return
                }
            }

            // Check if the message is a command
            if (content.startsWith(terra.config.prefix)) {
                terra.logger.debug(`Detected command: ${content}`)

                // Pass the message to the command handler for processing
                try {
                    await terra.commandHandler.handleMessage(msg)
                } catch (error) {
                    terra.logger.error(
                        `Error executing command: ${error.message}`
                    )
                    await terra.reply(
                        msg,
                        `❌ Error executing command: ${error.message}`
                    )
                }
            }
        }
    },
}
