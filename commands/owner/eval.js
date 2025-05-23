const { MessageType, Mimetype } = require('@fizzxydev/baileys-pro')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

module.exports = {
    name: 'eval',
    description: 'Evaluate JS code (single-line & multiline)',
    aliases: ['eval'],
    usage: '[prefix]eval [value]',
    ownerOnly: true,
    category: 'owner',
    execute: async (terra, msg, args, context) => {
        // 1. Ambil raw text pesan (extendedTextMessage jika ada, else conversation)
        const raw =
            msg.message.extendedTextMessage?.text ??
            msg.message.conversation ??
            ''

        // 2. Hapus command prefix dan nama command dari awal
        //    Asumsikan prefix di context.prefix, atau ganti sesuai yang kamu pakai
        const prefix = context.prefix // misal '!'
        const cmdLen = prefix.length + context.command.length + 1
        let code = raw.slice(cmdLen)

        // 3. Jika user membungkus dalam ```js\n…``` atau ```\n…```, strip backticks-nya
        code = code.replace(/```(?:js)?\n?([\s\S]*?)```/, '$1').trim()

        if (!code) {
            return terra.reply(msg, '⚠️ Masukkan kode untuk dieksekusi!')
        }

        try {
            // 4. Buat AsyncFunction agar bisa pakai await di top-level tanpa IIFE
            const fn = new AsyncFunction('terra', 'msg', 'context', code)
            // 5. Eksekusi
            const result = await fn(terra, msg, context, msg)
            // 6. Kirim hasilnya
            return terra.reply(msg, String(result))
        } catch (err) {
            terra.logger.error(`Eval error: ${err.stack}`)
            return terra.reply(msg, `⚠️ Error saat eksekusi: ${err.message}`)
        }
    },
}
