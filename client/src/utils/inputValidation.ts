/**
 * inputValidation.ts
 * Hook centralizado para validación y sanitización de inputs del proyecto.
 * Principio DRY: una sola fuente de verdad para límites y restricciones.
 */

// ─── Límites por tipo de campo (según stack-standards y security-skill) ───────
export const INPUT_LIMITS = {
  name: 60,         // Nombre / Apellido
  email: 120,       // Email
  phone: 20,        // Teléfono formateado: +54 9 11 1234-5678 = 18 chars
  password: 128,    // Contraseña — nunca más de 128 por bcrypt
  street: 100,      // Dirección: calle
  streetNumber: 10, // Número de puerta
  city: 60,         // Ciudad
  province: 60,     // Provincia
  zip: 10,          // Código postal argentino
  cuit: 13,         // CUIT/CUIL xx-xxxxxxxx-x
  businessName: 120,// Razón social
  address: 150,     // Dirección completa (perfil de usuario)
};

// ─── Handlers de sanitización por tipo ────────────────────────────────────────

/** Solo letras, espacios, tildes y guiones — para nombres */
export const onlyLetters = (value: string, maxLen: number): string =>
  value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]/g, '').slice(0, maxLen);

/**
 * Formatea número de teléfono argentino mientras se tipea.
 * Resultado objetivo: +54 9 11 1234-5678 (CABA) o +54 9 351 123-4567 (otras)
 *
 * Soporta:
 *  - Tipeo desde cero: 1 → +54 9 1 ... 11 12345678 → +54 9 11 1234-5678
 *  - Si el usuario ya escribe el 54 o el 9, los descarta y recompone
 */
export const formatPhone = (value: string): string => {
  if (!value) return '';

  // Solo dígitos del valor actual
  const digits = value.replace(/\D/g, '').slice(0, 13);

  if (digits.length === 0) return value.startsWith('+') ? '+' : '';

  // Descartar prefijo de país si el usuario lo escribió
  let rest = digits;
  if (digits.startsWith('549')) {
    rest = digits.slice(3);
  } else if (digits.startsWith('54')) {
    rest = digits.slice(2);
  } else if (digits.startsWith('9') && digits.length > 1) {
    rest = digits.slice(1);
  }

  // rest = [área][número]
  // CABA: área = "11" (2 dígitos), resto del país: 3 dígitos
  const prefix = '+54 9 ';

  if (rest.length === 0) return prefix.trimEnd();

  const isCaba = rest.startsWith('11');
  const areaLen = isCaba ? 2 : 3;
  const area = rest.slice(0, areaLen);
  const num = rest.slice(areaLen);

  if (num.length === 0) return `${prefix}${area}`;

  const part1 = num.slice(0, 4);
  const part2 = num.slice(4, 8);

  if (part2.length === 0) return `${prefix}${area} ${part1}`;
  return `${prefix}${area} ${part1}-${part2}`;
};

/** Solo dígitos — para zip, número de puerta, etc. */
export const onlyDigits = (value: string, maxLen: number): string =>
  value.replace(/[^\d]/g, '').slice(0, maxLen);

/** CUIT/CUIL: formato xx-xxxxxxxx-x (auto-formato mientras se tipea) */
export const formatCuit = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0,2)}-${digits.slice(2)}`;
  return `${digits.slice(0,2)}-${digits.slice(2,10)}-${digits.slice(10)}`;
};

/** Limitar texto genérico */
export const limitText = (value: string, maxLen: number): string =>
  value.slice(0, maxLen);

// ─── Handler de cambio de input — parsea según el campo ──────────────────────

type SetFormData<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Crea un onChange handler que sanitiza y limita el valor según el nombre del campo.
 * Uso: onChange={createInputHandler(setFormData)}
 */
export function createInputHandler<T extends Record<string, any>>(
  setFormData: SetFormData<T>
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    let sanitized = value;

    switch (name) {
      case 'firstName':
      case 'lastName':
        sanitized = onlyLetters(value, INPUT_LIMITS.name);
        break;
      case 'phone':
        sanitized = formatPhone(value);
        break;
      case 'password':
        sanitized = limitText(value, INPUT_LIMITS.password);
        break;
      case 'zip':
        sanitized = onlyDigits(value, INPUT_LIMITS.zip);
        break;
      case 'number': // número de puerta en checkout
        sanitized = onlyDigits(value, INPUT_LIMITS.streetNumber);
        break;
      case 'cuit':
        sanitized = formatCuit(value);
        break;
      case 'email':
        sanitized = limitText(value, INPUT_LIMITS.email);
        break;
      case 'street':
        sanitized = limitText(value, INPUT_LIMITS.street);
        break;
      case 'city':
        sanitized = limitText(value, INPUT_LIMITS.city);
        break;
      case 'state':
        sanitized = limitText(value, INPUT_LIMITS.province);
        break;
      case 'businessName':
        sanitized = limitText(value, INPUT_LIMITS.businessName);
        break;
      case 'address':
        sanitized = value.slice(0, INPUT_LIMITS.address);
        break;
      default:
        sanitized = limitText(value, 255);
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };
}
