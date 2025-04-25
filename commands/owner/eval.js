module.exports = {
  name: 'eval',
  description: 'Evaluate js code',
  aliases: ['=>', '>'],
  usage: '{prefix}=> [setting] [value]',
  ownerOnly: true,
  execute: async (terra, msg, args, context) => {
    // If no arguments, show current config
    if (!args.length) {
      return terra.reply(msg, "Please provide a code!");
    }
   
    try {
      // Evaluate JavaScript code
      const result = await eval(args);
      return terra.reply(msg, `${result}`);
    } catch (error) {
      terra.logger.error(`Error executing eval: ${error.message}`);
      return terra.reply(msg, `⚠️ there was an error while trying to execute the code: ${error.message}`);
    }
  }
};
