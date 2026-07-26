/**
 * U.S. jurisdictions for forms + corpus matrix.
 * Codes follow USPS abbreviations; `US` = federal / multi-state / nationwide.
 * Includes 50 states, DC, and major inhabited territories.
 */

const STATES_50 = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

/** District of Columbia (federal district — not a state). */
export const US_DISTRICT = [
  { code: "DC", name: "District of Columbia" },
] as const;

/**
 * Major inhabited U.S. territories (USPS codes).
 * Belong to the U.S. but are not states.
 */
export const US_TERRITORIES = [
  { code: "PR", name: "Puerto Rico" },
  { code: "GU", name: "Guam" },
  { code: "VI", name: "U.S. Virgin Islands" },
  { code: "AS", name: "American Samoa" },
  { code: "MP", name: "Northern Mariana Islands" },
] as const;

/** Federal / nationwide cell for multi-state and federal questions. */
export const US_FEDERAL = [
  { code: "US", name: "Federal / nationwide" },
] as const;

/** 50 states only. */
export const US_STATES_50 = STATES_50;

/**
 * Full jurisdiction list for /request + corpus matrix:
 * Federal + 50 states + DC + territories.
 */
export const US_STATES = [
  ...US_FEDERAL,
  ...STATES_50,
  ...US_DISTRICT,
  ...US_TERRITORIES,
] as const;

export type UsStateCode = (typeof US_STATES)[number]["code"];

/** Codes available on the public form (same as full matrix). */
export const US_STATES_LANCAMENTO = US_STATES;

export type UsStateLancamento = UsStateCode;

/**
 * Corpus matrix jurisdictions (same codes, Federal first for admin readability).
 * 1 federal + 50 states + DC + 5 territories = 57.
 */
export const JURISDICTIONS_CORPUS = US_STATES.map((j) => j.code);

export const TEXTO_ESCOPO_ESTADOS =
  "Reports cover public U.S. sources across the 50 states, the District of Columbia, " +
  "and major U.S. territories. Select the jurisdiction most connected to your dispute, " +
  "or Federal / nationwide when the issue spans multiple states or is federal in nature.";

export function isUsStateLancamento(valor: string): valor is UsStateLancamento {
  const u = valor.trim().toUpperCase();
  return US_STATES_LANCAMENTO.some((s) => s.code === u);
}

export function normalizarUsState(
  valor: string | null | undefined
): UsStateLancamento | null {
  if (!valor) return null;
  const u = valor.trim().toUpperCase();
  return isUsStateLancamento(u) ? u : null;
}

export function labelUsState(code: string): string {
  const found = US_STATES.find((s) => s.code === code.toUpperCase());
  return found ? `${found.name} (${found.code})` : code;
}

export function isUsTerritory(code: string): boolean {
  const u = code.trim().toUpperCase();
  return US_TERRITORIES.some((t) => t.code === u);
}
