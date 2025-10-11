// Função utilitária para extrair apenas dígitos de um telefone
export function justDigits(phone?: string | number | null) {
  return phone ? String(phone).replace(/\D/g, "") : "";
}

function buildWaMessage(userName?: string, adminName?: string) {
  const name = userName?.trim() || "usuário";
  const admin = adminName?.trim() || "administrador";

  return `Olá ${name}!%0A%0ASou ${admin}. Sou administrador do sistema clubinho.%0A%0AGostaria de falar com você sobre uma coisa:%0A%0A`;
}

export function buildWhatsappLink(userName?: string, adminName?: string, phone?: string) {
  let digits = justDigits(phone);
  if (!digits) return null;
  
  // Adiciona o código do Brasil (+55) se o número não começar com 55
  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }
  
  const text = buildWaMessage(userName, adminName);
  return `https://wa.me/${digits}?text=${text}`;
}

