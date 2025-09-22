// Função utilitária para extrair apenas dígitos de um telefone
export function justDigits(phone?: string | number | null) {
  return phone ? String(phone).replace(/\D/g, "") : "";
}

function buildWaMessage(userName?: string, adminName?: string) {
  const name = userName?.trim() || "usuário";
  const admin = adminName?.trim() || "administrador";

  return `Olá ${name}!

Sou ${admin}. Sou administrador do sistema clubinho.

Gostaria de falar com você sobre uma coisa:

`;
}

export function buildWhatsappLink(userName?: string, adminName?: string, phone?: string) {
  const digits = justDigits(phone);
  if (!digits) return null;
  const text = encodeURIComponent(buildWaMessage(userName, adminName));
  return `https://wa.me/${digits}?text=${text}`;
}

