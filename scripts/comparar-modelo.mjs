import fs from "node:fs"; import PizZip from "pizzip"; import Docxtemplater from "docxtemplater";
import { textoDoParagrafo } from "./preparar-molde-1.mjs";
const ler=f=>new PizZip(fs.readFileSync(f));
const o=ler("moldes/originais/1_intermediacao_com_exclusividade.docx"), m=ler("moldes/modelos/1_intermediacao_com_exclusividade.docx");
const P=x=>x.file("word/document.xml").asText().match(/<w:p[ >][\s\S]*?<\/w:p>/g);
const po=P(o), pm=P(m);
console.log(po.length,pm.length);
po.forEach((p,i)=>{ if(p!==pm[i]){console.log(`--- ${i}\nANTES: ${textoDoParagrafo(p).slice(0,400)}\nDEPOIS: ${textoDoParagrafo(pm[i])}`)} });
for (const n of Object.keys(o.files)) if(n!=="word/document.xml" && o.file(n) && o.file(n).asText && !o.files[n].dir){ if(Buffer.compare(Buffer.from(o.file(n).asUint8Array()),Buffer.from(m.file(n).asUint8Array()))) console.log("DIFERE",n)}
const d=new Docxtemplater(m,{paragraphLoop:true,linebreaks:true,delimiters:{start:"{",end:"}"}});
console.log("tags:",Object.keys(d.getFullText? {}:{}), "compilou ok");
