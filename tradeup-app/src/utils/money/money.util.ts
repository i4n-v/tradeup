interface IMask {
  mask: (value: string) => string;
  unmask: (input: string) => string;
}

/** Formata número/string canônica ("1234.56") para exibição pt-BR ("1.234,56"). */
function formatBrl(canonical: string | number): string {
  const n = typeof canonical === 'string' ? parseFloat(canonical) : canonical;
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Converte dígitos digitados (estilo caixa) para canônico "1234.56". */
function parseBrlInput(typed: string): string {
  const digits = typed.replace(/\D/g, '');
  return digits ? (Number(digits) / 100).toFixed(2) : '';
}

/** Formata string canônica BTC ("0.00100000") para exibição pt-BR ("0,00100000"). */
function formatBtc(canonical: string): string {
  if (!canonical) return '';
  const trailingDot = canonical.endsWith('.');
  return canonical.replace('.', ',') + (trailingDot ? '' : '');
}

/**
 * Normaliza entrada do teclado BTC (vírgula ou ponto como decimal) para
 * canônico com ponto, até 8 casas decimais.
 */
function parseBtcInput(typed: string): string {
  const normalized = typed.replace(',', '.');
  const [int = '', frac = ''] = normalized.split('.');
  const intClean = int.replace(/\D/g, '');
  const fracClean = frac.replace(/\D/g, '').slice(0, 8);
  if (!normalized.includes('.')) return intClean;
  return `${intClean}.${fracClean}`;
}

const brlMask: IMask = { mask: formatBrl, unmask: parseBrlInput };
const btcMask: IMask = { mask: formatBtc, unmask: parseBtcInput };

export type { IMask };
export { formatBrl, parseBrlInput, formatBtc, parseBtcInput, brlMask, btcMask };
