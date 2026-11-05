// Transforma o Word original do molde 1 em um modelo com marcadores {assim}.
// Só troca os trechos variáveis. Cabeçalho, rodapé, marca d'água, estilos e
// todo o texto jurídico ficam exatamente como no original.
// Uso: node scripts/preparar-molde-1.mjs
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";

const raiz = path.resolve(import.meta.dirname, "..");
const origem = path.join(raiz, "moldes/originais/1_intermediacao_com_exclusividade.docx");
const destino = path.join(raiz, "moldes/modelos/1_intermediacao_com_exclusividade.docx");

const decodificar = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
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

export function textoDoParagrafo(p) {
  return lerRuns(p).map((r) => r.texto).join("");
}

/** Troca `antigo` (texto ou regex) por `novo`, juntando os pedaços internos do Word. */
function substituir(p, antigo, novo) {
  const runs = lerRuns(p);
  const todo = runs.map((r) => r.texto).join("");
  let ini, tam;
  if (antigo instanceof RegExp) {
    const m = todo.match(antigo);
    if (!m) throw new Error(`Trecho não encontrado: ${antigo}`);
    ini = m.index; tam = m[0].length;
  } else {
    ini = todo.indexOf(antigo);
    if (ini < 0) throw new Error(`Trecho não encontrado: "${antigo}"`);
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
function substituirTudo(p, comeco, novo) {
  const todo = textoDoParagrafo(p);
  if (!todo.startsWith(comeco)) throw new Error(`Parágrafo inesperado: "${todo.slice(0, 40)}"`);
  return substituir(p, todo, novo);
}

// Cada edição: [índice do parágrafo, começo esperado do texto, função de troca]
const edicoes = [
  [3, "[NOME", (p) => {
    p = substituir(p,
      "[NOME, estado civil, profissão, data de nascimento, RG sob o nº e CPF de nº",
      "{proprietario_nome}, {proprietario_estado_civil}, {proprietario_profissao}, nascido(a) em {proprietario_nascimento}, " +
      "{#proprietario_rg}RG sob o nº {proprietario_rg} e {/proprietario_rg}CPF de nº {proprietario_cpf}");
    return substituir(p,
      "na cidade de  , Bahia, CEP: 48450-000, telefone:, e-mail: ",
      "na cidade de {proprietario_cidade}, {proprietario_uf}, CEP: {proprietario_cep}, telefone: {proprietario_telefone}, e-mail: {proprietario_email}.");
  }],
  [6, "LUCAUTO EMPREENDIMENTOS LTDA", (p) => {
    p = substituir(p, "CNPJ nº CRECI Jurídico nº", "CNPJ nº {empresa_cnpj}, CRECI Jurídico nº {empresa_creci}");
    return substituir(p, "POLLYANA MALTA MARQUES CUNHA, CREC nº:", "{corretora_nome}, CREC nº: {corretora_creci}.");
  }],
  [11, "Casa residencial", (p) => substituirTudo(p, "Casa residencial",
    "{imovel_descricao} Localizado em {imovel_localizacao}. Imóvel matriculado sob o nº {imovel_matricula} do {imovel_cartorio} de Registro de Imóveis de Euclides da Cunha/BA.")],
  [21, "3.1.", (p) => substituir(p, "total de R$ (digite o valor por extenso).", "total de {valor} ({valor_extenso}).")],
  [27, "Banco:", (p) => substituir(p, /Banco: _+/, "Banco: {banco}")],
  [28, "Agência:", (p) => substituir(p, /Agência: _+/, "Agência: {agencia}")],
  [29, "Favorecido:", (p) => substituir(p, /Favorecido: _+/, "Favorecido: {favorecido}")],
  [34, "4.1.", (p) => substituir(p, "8% (oito", "{comissao_pct}% ({comissao_extenso}")],
  [84, "Euclides da Cunha/BA, 07", (p) => substituir(p, "07 de novembro de 2025", "{data_assinatura}")],
];

export const PARAGRAFOS_EDITADOS = edicoes.map(([i]) => i);

if (process.argv[1] === import.meta.filename) {
  const zip = new PizZip(fs.readFileSync(origem));
  let xml = zip.file("word/document.xml").asText();
  const PARA = /<w:p[ >][\s\S]*?<\/w:p>/g;
  let n = -1;
  const porIndice = new Map(edicoes.map(([i, c, f]) => [i, [c, f]]));
  xml = xml.replace(PARA, (p) => {
    n++;
    const ed = porIndice.get(n);
    if (!ed) return p;
    const [comeco, f] = ed;
    if (!textoDoParagrafo(p).startsWith(comeco)) throw new Error(`Parágrafo ${n} não começa com "${comeco}"`);
    return f(p);
  });
  zip.file("word/document.xml", xml);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, zip.generate({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("Modelo gravado em", path.relative(raiz, destino));
}
