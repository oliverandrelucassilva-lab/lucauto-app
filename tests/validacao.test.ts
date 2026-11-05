import { describe, expect, it } from "vitest";
import { montarDados } from "@/lib/contratos/dados";
import { mascaraCep, mascaraCpf, mascaraNumerica, mascaraTelefone, normalizar } from "@/lib/contratos/formatos";
import { ENTRADA_FICTICIA, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";

const problemas = (extra: Record<string, string>) =>
  montarDados({ ...ENTRADA_FICTICIA, ...extra }, EMPRESA_PREENCHIDA).problemas.map((p) => `${p.chave}:${p.motivo}`);

describe("campos numéricos só aceitam números", () => {
  it.each([
    ["telefone com letras", { proprietario_telefone: "wedwewe" }, "proprietario_telefone:invalido"],
    ["telefone curto", { proprietario_telefone: "9999" }, "proprietario_telefone:invalido"],
    ["telefone misturado", { proprietario_telefone: "75 9999a-9999" }, "proprietario_telefone:invalido"],
    ["CEP com letras", { proprietario_cep: "sdwew" }, "proprietario_cep:invalido"],
    ["CEP curto", { proprietario_cep: "4850" }, "proprietario_cep:invalido"],
    ["RG com letras", { proprietario_rg: "ss" }, "proprietario_rg:invalido"],
    ["CPF com letras", { proprietario_cpf: "abc111.444.777-35" }, "proprietario_cpf:invalido"],
    ["CPF com dígito errado", { proprietario_cpf: "111.444.777-36" }, "proprietario_cpf:invalido"],
    ["matrícula com letras", { imovel_matricula: "abc" }, "imovel_matricula:invalido"],
    ["agência com letras", { agencia: "ag01" }, "agencia:invalido"],
    ["valor com letras", { valor: "12abc" }, "valor:invalido"],
  ])("%s é recusado", (_n, extra, esperado) => expect(problemas(extra)).toContain(esperado));

  it("aceita os formatos certos", () => {
    expect(problemas({ proprietario_telefone: "75999991234", proprietario_cep: "48500000", proprietario_rg: "04.739.347-52", proprietario_cpf: "11144477735", agencia: "0123-4", imovel_matricula: "25.487" })).toEqual([]);
  });

  it("RG continua opcional, mas se for digitado só pode ter números", () => {
    expect(problemas({ proprietario_rg: "" })).toEqual([]);
    expect(problemas({ proprietario_rg: "12a" })).toContain("proprietario_rg:invalido");
  });

  it("telefone e CEP saem formatados no contrato", () => {
    const { dados } = montarDados({ ...ENTRADA_FICTICIA, proprietario_telefone: "75999991234", proprietario_cep: "48500000" }, EMPRESA_PREENCHIDA);
    expect(dados.proprietario_telefone).toBe("(75) 99999-1234");
    expect(dados.proprietario_cep).toBe("48500-000");
  });
});

describe("e-mail: qualquer provedor", () => {
  it.each(["a@gmail.com", "a.b@hotmail.com", "nome_sobrenome@outlook.com.br", "x@empresa.com.br", "x+teste@yahoo.com", "contato@lucauto.com.br"])("aceita %s", (e) =>
    expect(problemas({ proprietario_email: e })).not.toContain("proprietario_email:invalido"));
  it.each(["sem-arroba.com", "a@b", "a@@gmail.com", "a b@gmail.com", "a@gmail..com", "@gmail.com"])("recusa %s", (e) =>
    expect(problemas({ proprietario_email: e })).toContain("proprietario_email:invalido"));
});

describe("datas", () => {
  it("ano com 3 dígitos ou no futuro é recusado", () => {
    expect(problemas({ proprietario_nascimento: "0322-02-23" })).toContain("proprietario_nascimento:invalido");
    expect(problemas({ proprietario_nascimento: "2999-01-01" })).toContain("proprietario_nascimento:invalido");
    expect(problemas({ data_assinatura: "0026-11-05" })).toContain("data_assinatura:invalido");
  });
  it("nomes não aceitam números", () => {
    expect(problemas({ proprietario_nome: "Maria 123" })).toContain("proprietario_nome:invalido");
  });
});

describe("máscaras enquanto digita", () => {
  it("telefone", () => {
    expect(mascaraTelefone("7")).toBe("(7");
    expect(mascaraTelefone("75")).toBe("(75");
    expect(mascaraTelefone("759")).toBe("(75) 9");
    expect(mascaraTelefone("7599999123")).toBe("(75) 9999-9123");
    expect(mascaraTelefone("75999991234")).toBe("(75) 99999-1234");
    expect(mascaraTelefone("abc75xx")).toBe("(75");
  });
  it("CEP, CPF e numérico", () => {
    expect(mascaraCep("48500000")).toBe("48500-000");
    expect(mascaraCpf("11144477735")).toBe("111.444.777-35");
    expect(mascaraNumerica("04.739.347-5x2")).toBe("04.739.347-52");
  });
  it("busca ignora acento e maiúscula", () => {
    expect(normalizar("São Paulo")).toBe("sao paulo");
  });
});
