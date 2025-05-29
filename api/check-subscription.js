import crypto from 'crypto';

export default async function handler(req, res) {
  const botToken = process.env.BOT_TOKEN;
  const channel = process.env.CHANNEL_USERNAME;
  const data = req.body;

  const secret = crypto.createHash('sha256').update(botToken).digest();
  const checkHash = data.hash;
  const authData = { ...data };
  delete authData.hash;

  const sorted = Object.keys(authData).sort().map(k => `${k}=${authData[k]}`).join('\n');
  const hash = crypto.createHmac('sha256', secret).update(sorted).digest('hex');

  if (hash !== checkHash) {
    return res.status(403).json({ error: "Invalid auth" });
  }

  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channel}&user_id=${data.id}`);
  const tgData = await tgRes.json();

  const status = tgData.result?.status;

  if (["creator", "administrator", "member"].includes(status)) {
    res.json({ subscribed: true });
  } else {
    res.json({ subscribed: false });
  }
}
