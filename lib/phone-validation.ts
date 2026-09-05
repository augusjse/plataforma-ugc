export type PhoneCountry = { code: string; name: string; dialCode: string; expectedDigits: number };
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "BR", name: "Brasil", dialCode: "+55", expectedDigits: 11 },
  { code: "US", name: "Estados Unidos", dialCode: "+1", expectedDigits: 10 },
  { code: "PT", name: "Portugal", dialCode: "+351", expectedDigits: 9 },
];
export function validatePhone(countryCode: string, phone: string) {
  const country = PHONE_COUNTRIES.find(({ code }) => code === countryCode);
  if (!country) return "País obrigatório";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 2) return "Faltam dígitos";
  if (country.code === "BR" && Number(digits.slice(0, 2)) < 11) return "DDD inválido para o país";
  if (digits.length < country.expectedDigits) return `Número incompleto (esperado ${country.expectedDigits} dígitos)`;
  if (digits.length > country.expectedDigits) return `Número inválido (esperado ${country.expectedDigits} dígitos)`;
  return null;
}
export function normalizePhone(countryCode: string, phone: string) {
  const country = PHONE_COUNTRIES.find(({ code }) => code === countryCode);
  return country ? `${country.dialCode}${phone.replace(/\D/g, "")}` : "";
}
