export function normalize(s?: string | null) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function roleChipColor(role?: string) {
  switch (role) {
    case "ADMIN":
      return "secondary";
    case "COORDINATOR":
      return "primary";
    case "TEACHER":
      return "success";
    default:
      return "default";
  }
}

export const anchorProps = (url?: string) =>
  url
    ? ({ component: "a" as const, href: url, target: "_blank", rel: "noopener noreferrer" })
    : ({});

const CORE_KEYS = new Set([
  "id",
  "name",
  "email",
  "phone",
  "role",
]);

const SENSITIVE_KEYS = new Set([
  "password",
  "refreshToken",
  "commonUser",
  "createdAt",
  "updatedAt",
]);

export const isCoreOrSensitive = (k: string) => CORE_KEYS.has(k) || SENSITIVE_KEYS.has(k);
