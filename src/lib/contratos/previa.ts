// Prévia na tela: usa o texto do próprio modelo do Word, trocando os marcadores
// pelos valores. Trechos pendentes aparecem destacados.

export interface Trecho {
  texto: string;
  pendente: boolean;
}

/**
 * @param texto    texto do parágrafo com marcadores {chave} e {#chave}...{/chave}
 * @param dados    valores dos marcadores ("" = não preenchido)
 * @param rotulos  nome amigável de cada marcador (usado quando está pendente)
 * @param opcionais marcadores que podem ficar em branco (o trecho condicional some)
 */
export function preencherTexto(texto: string, dados: Record<string, string>, rotulos: Record<string, string>): Trecho[] {
  // Trechos condicionais: {#rg}RG sob o nº {rg} e {/rg}
  const semCondicionais = texto.replace(/\{#(\w+)\}([\s\S]*?)\{\/\1\}/g, (_, chave: string, dentro: string) => (dados[chave] ? dentro : ""));
  const trechos: Trecho[] = [];
  let cursor = 0;
  for (const m of semCondicionais.matchAll(/\{(\w+)\}/g)) {
    if (m.index > cursor) trechos.push({ texto: semCondicionais.slice(cursor, m.index), pendente: false });
    const valor = dados[m[1]];
    trechos.push(valor && valor !== "[A CONFIRMAR]" ? { texto: valor, pendente: false } : valor ? { texto: valor, pendente: true } : { texto: `[${rotulos[m[1]] ?? m[1]}]`, pendente: true });
    cursor = m.index + m[0].length;
  }
  if (cursor < semCondicionais.length) trechos.push({ texto: semCondicionais.slice(cursor), pendente: false });
  return trechos;
}
