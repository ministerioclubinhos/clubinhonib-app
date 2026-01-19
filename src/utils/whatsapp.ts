
export function justDigits(phone?: string | number | null) {
  return phone ? String(phone).replace(/\D/g, "") : "";
}

function buildWaMessage(userName?: string, adminName?: string) {
  const name = userName?.trim() || "usuário";
  const admin = adminName?.trim() || "administrador";

  return `Olá ${name}!\n\nSou ${admin}. Sou administrador do sistema clubinho.\n\nGostaria de falar com você sobre uma coisa:\n\n`;
}

function buildBirthdayMessage(userName?: string, adminName?: string, gender?: string) {
  const name = userName?.trim() || "usuário";
  const admin = adminName?.trim() || "administrador";

  if (gender === 'Masculino') {
    return `🎉 Fala ${name}! 🥳 Parabéns 🎈 pelo seu dia, campeão!!! 🙌😎\n\n🎂 Aqui é ${admin} 🎁 do Clubinho. 🍕🥤\n\n🙏 Que Deus 🕊️ te abençoe grandemente ✨ e que Jesus ✝️ ilumine sempre 💙 o seu caminho! 🦁 Te desejo muita saúde, 🔥 alegria e conquistas! 👑🙌\n\n👊 Curta muito 🚀 o seu dia! 🎶 Tmj! 🤜🤛`;
  } else if (gender === 'Feminino') {
    return `🎉 Oi ${name}! 🥳 Feliz aniversário, 🎈 princesa!!! 💃✨\n\n🎂 Aqui é ${admin} 🎁 do Clubinho. 🍭🍬\n\n🙏 Que Papai do Céu 🕊️ te abençoe ✨ e Jesus ✝️ guarde 💖 seu coraçãozinho 🌹 com muito amor! 🦋 Que você continue 🙌 brilhando e espalhando luz! 🎀👑\n\n🥰 Aproveite muito 😍 o seu dia! 💝💌🧸`;
  }

  return `🎉 Olá ${name}! 🥳 Feliz aniversário! 🎈✨\n\n🎂 Aqui é ${admin} 🎁 do Clubinho. 🤩\n\n🙏 Que Deus 🕊️ e Jesus ✨ abençoem grandemente 💛 sua vida com muita saúde 🙌 e alegrias! 🎶\n\n👏 Parabéns! 👏👏🚀`;
}

export function buildWhatsappLink(userName?: string, adminName?: string, phone?: string, isBirthday: boolean = false, gender?: string) {
  let digits = justDigits(phone);
  if (!digits) return null;

  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }

  const rawMessage = isBirthday
    ? buildBirthdayMessage(userName, adminName, gender)
    : buildWaMessage(userName, adminName);

  const encodedMessage = encodeURIComponent(rawMessage);

  return `https://api.whatsapp.com/send?phone=${digits}&text=${encodedMessage}`;
}
