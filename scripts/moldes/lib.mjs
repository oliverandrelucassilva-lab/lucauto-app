// Ferramentas para transformar o Word original de um molde em modelo com marcadores {assim}.
// Só troca os trechos variáveis. Cabeçalho, rodapé, marca d'água, estilos e o texto jurídico ficam como no original.
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";

export const raiz = path.resolve(import.meta.dirname, "../..");

const decodificar = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const codificar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const RUN = /<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g;
const TEXTO = /(<w:t(?:\s[^>]*)?>)([\s\S]*?)(<\/w:t>)/;

function lerRuns(p) {
  const runs = [];
  let m;
  RUN.lastIndex = 0;
  while ((m = RUN.exec(p))) {
    const t = m[0].match(TEXTO);
    if (!t) continue; // run sem texto (ex.: imagem): ignora
    runs.push({ ini: m.index, fim: m.index + m[0].length, xml: m[0], texto: decodificar(t[2]) });
  }
  return runs;
}

export const textoDoParagrafo = (p) => lerRuns(p).map((r) => r.texto).join("");

/** Troca `antigo` (texto ou regex) por `novo`, juntando os pedaços internos do Word. */
export function substituir(p, antigo, novo) {
  const runs = lerRuns(p);
  const todo = runs.map((r) => r.texto).join("");
  let ini, tam;
  if (antigo instanceof RegExp) {
    const m = todo.match(antigo);
    if (!m) throw new Error(`Trecho não encontrado: ${antigo}\n  texto: ${todo.slice(0, 200)}`);
    ini = m.index; tam = m[0].length;
  } else {
    ini = todo.indexOf(antigo);
    if (ini < 0) throw new Error(`Trecho não encontrado: "${antigo}"\n  texto: ${todo.slice(0, 200)}`);
    if (todo.indexOf(antigo, ini + 1) >= 0) throw new Error(`Trecho repetido: "${antigo}"`);
    tam = antigo.length;
  }
  const fimTxt = ini + tam;
  let pos = 0;
  const cobertos = [];
  for (const r of runs) {
    const a = pos, b = pos + r.texto.length;
    if (b > ini && a < fimTxt) cobertos.push({ r, a, b });
    pos = b;
  }
  const primeiro = cobertos[0], ultimo = cobertos[cobertos.length - 1];
  const prefixo = primeiro.r.texto.slice(0, ini - primeiro.a);
  const sufixo = ultimo.r.texto.slice(fimTxt - ultimo.a);
  const textoNovo = codificar(prefixo + novo + sufixo);
  const xmlPrimeiro = primeiro.r.xml.replace(TEXTO, () => `<w:t xml:space="preserve">${textoNovo}</w:t>`);
  let saida = "";
  let cursor = 0;
  for (const { r } of cobertos) {
    saida += p.slice(cursor, r.ini);
    saida += r === primeiro.r ? xmlPrimeiro : "";
    cursor = r.fim;
  }
  return saida + p.slice(cursor);
}

/** Troca o parágrafo inteiro, conferindo o começo para não errar de lugar. */
export function substituirTudo(p, comeco, novo) {
  const todo = textoDoParagrafo(p);
  if (!todo.startsWith(comeco)) throw new Error(`Parágrafo inesperado: "${todo.slice(0, 40)}"`);
  return substituir(p, todo, novo);
}

/** Cópia de um parágrafo com outro texto (mesmo estilo). Usado para blocos opcionais. */
export const clonarComTexto = (p, texto) => substituirTudo(p, "", texto);

/**
 * Aplica as edições de um molde. `edicoes`: [índice do parágrafo, começo esperado do texto, função(p) -> xml de 1 ou mais parágrafos].
 * Grava moldes/modelos/<slug>.docx e devolve os índices editados.
 */
export function executar(slug, edicoes) {
  const origem = path.join(raiz, `moldes/originais/${slug}.docx`);
  const destino = path.join(raiz, `moldes/modelos/${slug}.docx`);
  const zip = new PizZip(fs.readFileSync(origem));
  let xml = zip.file("word/document.xml").asText();
  const porIndice = new Map(edicoes.map(([i, c, f]) => [i, [c, f]]));
  const originais = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []; // para clonar parágrafos de outros lugares
  let n = -1;
  const visto = new Set();
  xml = xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (p) => {
    n++;
    const ed = porIndice.get(n);
    if (!ed) return p;
    visto.add(n);
    const [comeco, f] = ed;
    if (!textoDoParagrafo(p).startsWith(comeco)) throw new Error(`Parágrafo ${n} não começa com "${comeco}" (começa com "${textoDoParagrafo(p).slice(0, 40)}")`);
    return f(p, originais);
  });
  for (const i of porIndice.keys()) if (!visto.has(i)) throw new Error(`Parágrafo ${i} não existe no original.`);
  zip.file("word/document.xml", xml);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, zip.generate({ type: "nodebuffer", compression: "DEFLATE" }));
  return edicoes.map(([i]) => i);
}

/** Marcador de pessoa, para os moldes de "residente em [endereço completo]" (RG e endereço opcionais). */
export const pessoaComEndereco = (pre, { nacionalidade = false } = {}) =>
  `{${pre}_nome}, ${nacionalidade ? `{${pre}_nacionalidade}, ` : ""}{${pre}_estado_civil}, {${pre}_profissao}, ` +
  `{#${pre}_rg}RG nº {${pre}_rg}, {/${pre}_rg}CPF nº {${pre}_cpf}, {#${pre}_endereco}residente em {${pre}_endereco}, {/${pre}_endereco}e-mail {${pre}_email}.`;

/** Marcador de pessoa, para os moldes "residente e domiciliado (a) na cidade de ..." (RG opcional). */
export const pessoaPorCidade = (pre) =>
  `{${pre}_nome}, {${pre}_estado_civil}, {${pre}_profissao}, nascido(a) em {${pre}_nascimento}, ` +
  `{#${pre}_rg}RG sob o nº {${pre}_rg} e {/${pre}_rg}CPF de nº {${pre}_cpf}, residente e domiciliado (a) na cidade de {${pre}_cidade}, {${pre}_uf}, ` +
  `CEP: {${pre}_cep}, telefone: {${pre}_telefone}, e-mail: {${pre}_email}.`;
