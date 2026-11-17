'use strict';
// Site estático: os dados permanecem somente no navegador atual (localStorage).
const CHAVE = 'apresentacoes-sorteio-v2';
const CHAVE_NOMES = 'apresentacoes-lista-nomes-v2';
const padrao = (window.ALUNOS_INICIAIS || []).map(n => String(n).trim()).filter(Boolean);
function nomesSalvos() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_NOMES));
    return Array.isArray(salvo) && salvo.every(n => typeof n === 'string') ? salvo : padrao;
  } catch { return padrao; }
}
let nomes = nomesSalvos();
let assinatura = JSON.stringify(nomes);
let cadastro = nomes.map((nome, id) => ({ id, nome }));
const $ = id => document.getElementById(id);
const base = () => ({ assinatura, disponiveis: cadastro.map(a => a.id), espera: [], apresentaram: [], sorteado: null });
function recuperar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (!salvo || salvo.assinatura !== assinatura) return base();
    const todos = [...salvo.disponiveis, ...salvo.espera, ...salvo.apresentaram];
    if (!Array.isArray(salvo.disponiveis) || !Array.isArray(salvo.espera) || !Array.isArray(salvo.apresentaram) ||
      todos.length !== cadastro.length || new Set(todos).size !== cadastro.length ||
      todos.some(id => !Number.isInteger(id) || id < 0 || id >= cadastro.length) ||
      (salvo.sorteado !== null && !salvo.disponiveis.includes(salvo.sorteado))) return base();
    return salvo;
  } catch { return base(); }
}
let estado = recuperar();
let aviso = '';
function guardar(){try {localStorage.setItem(CHAVE, JSON.stringify(estado));}catch { /* navegador com armazenamento bloqueado */ }}
function aluno(id){return cadastro[id].nome;}
function criarLista(destino, ids, numerada=false){
  const container = $(destino);
  container.replaceChildren();
  if (!ids.length) {
    const vazio = document.createElement('div');
    vazio.className='empty'; vazio.textContent='Nenhum aluno nesta lista.'; container.append(vazio); return;
  }
  ids.forEach((id, indice) => {
    const linha=document.createElement('div'); linha.className='name-row';
    const simbolo=document.createElement('span'); simbolo.className='person-symbol';
    simbolo.setAttribute('aria-hidden','true'); simbolo.textContent=numerada ? String(indice+1) : '•';
    const texto=document.createElement('span'); texto.textContent=aluno(id);
    linha.append(simbolo,texto);container.append(linha);
  });
}
function renderizar(){
  const d=estado.disponiveis.length,e=estado.espera.length,a=estado.apresentaram.length;
  $('badge-disponiveis').textContent=`${d} disponíveis`;
  $('total-disponiveis').textContent=d;
  $('stat-disponiveis').textContent=d;$('stat-espera').textContent=e;$('stat-apresentaram').textContent=a;
  $('count-d').textContent=d;$('count-e').textContent=e;$('count-a').textContent=a;
  const selecionado=estado.sorteado!==null;
  $('nome-sorteado').textContent=selecionado?aluno(estado.sorteado):d===0?'Sorteio concluído':'Nenhum aluno sorteado';
  $('pergunta').textContent=selecionado?'Este aluno pode apresentar agora?':d===0?'Todos os alunos já apresentaram.':'Clique no botão para iniciar o sorteio.';
  $('botoes-iniciais').hidden=selecionado;
  $('botoes-decisao').hidden=!selecionado;
  $('sortear').disabled=d===0;
  $('aviso').textContent=aviso;
  criarLista('lista-disponiveis',estado.disponiveis);
  criarLista('resumo-disponiveis',estado.disponiveis);
  criarLista('resumo-espera',estado.espera);
  criarLista('resumo-apresentaram',estado.apresentaram,true);
}
function atualizar(){guardar();renderizar();}
function indiceAleatorio(max) {
  // Amostragem uniforme sem viés de módulo quando crypto está disponível.
  if(window.crypto && window.crypto.getRandomValues){
    const limite=Math.floor(4294967296/max)*max;
    const buffer=new Uint32Array(1);
    do {window.crypto.getRandomValues(buffer);}while(buffer[0]>=limite);
    return buffer[0]%max;
  }
  return Math.floor(Math.random()*max);
}
function sortear(){
  if(estado.sorteado!==null || estado.disponiveis.length===0)return;
  estado.sorteado=estado.disponiveis[indiceAleatorio(estado.disponiveis.length)];
  aviso='';atualizar();
}
function decidir(podeApresentar){
  if(estado.sorteado===null)return;
  const id=estado.sorteado;
  estado.disponiveis=estado.disponiveis.filter(item=>item!==id);
  if(podeApresentar)estado.apresentaram.push(id);else estado.espera.push(id);
  estado.sorteado=null;
  if(estado.disponiveis.length===0 && estado.espera.length>0){
    estado.disponiveis=[...estado.espera];estado.espera=[];
    aviso='Novo ciclo: os alunos em espera retornaram ao sorteio.';
  }else{
    aviso=podeApresentar?`${aluno(id)} foi incluído nas apresentações.`:`${aluno(id)} foi colocado em espera.`;
  }
  atualizar();
}
function cancelar(){
  if(estado.sorteado===null)return;
  estado.sorteado=null;aviso='Sorteio cancelado. O aluno permanece disponível.';atualizar();
}
function mudarAba(aba){
  document.querySelectorAll('.tab').forEach(botao=>{
    const ativo=botao.dataset.tab===aba;
    botao.classList.toggle('active',ativo);
    if(ativo)botao.setAttribute('aria-current','page');else botao.removeAttribute('aria-current');
  });
  $('view-sorteio').hidden=aba!=='sorteio';$('view-resumo').hidden=aba!=='resumo';$('view-alunos').hidden=aba!=='alunos';
}
$('sortear').addEventListener('click',sortear);
$('apresentar').addEventListener('click',()=>decidir(true));
$('esperar').addEventListener('click',()=>decidir(false));
$('cancelar').addEventListener('click',cancelar);
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>mudarAba(b.dataset.tab)));
const modal=$('modal-reinicio');
$('reiniciar').addEventListener('click',()=>{
  if(typeof modal.showModal==='function')modal.showModal();
  else if(window.confirm('Deseja realmente reiniciar o sorteio?'))reiniciar();
});
modal.addEventListener('close',()=>{if(modal.returnValue==='confirmar')reiniciar();});
function reiniciar(){estado=base();aviso='Sorteio reiniciado.';atualizar();}
function extrairNomes(texto) {
  return texto.split(/\r?\n/).map(nome => nome.trim().replace(/\s+/g, ' ')).filter(Boolean);
}
function atualizarContagem() {
  const quantidade = extrairNomes($('entrada-alunos').value).length;
  $('contador-nomes').textContent = `${quantidade} ${quantidade === 1 ? 'aluno' : 'alunos'}`;
}
$('entrada-alunos').value = nomes.join('\n');
$('entrada-alunos').addEventListener('input', () => {
  atualizarContagem();
  $('aviso-alunos').textContent = '';
});
$('carregar-alunos').addEventListener('click', () => {
  const propostos = extrairNomes($('entrada-alunos').value);
  const status = $('aviso-alunos');
  if (propostos.length === 0) {
    status.textContent = 'Informe pelo menos um aluno, com um nome por linha.';
    return;
  }
  const vistos = new Set();
  const repetidos = propostos.filter(nome => {
    const chave = nome.toLocaleLowerCase('pt-BR');
    if (vistos.has(chave)) return true;
    vistos.add(chave);
    return false;
  });
  if (repetidos.length) {
    status.textContent = `Há nomes repetidos: ${[...new Set(repetidos)].join(', ')}. Corrija antes de carregar.`;
    return;
  }
  if (JSON.stringify(propostos) === assinatura) {
    status.textContent = 'Esta lista já está carregada.';
    return;
  }
  if (!window.confirm('Carregar esta lista? O sorteio atual será reiniciado e o histórico será apagado.')) return;
  nomes = propostos;
  assinatura = JSON.stringify(nomes);
  cadastro = nomes.map((nome, id) => ({ id, nome }));
  try { localStorage.setItem(CHAVE_NOMES, JSON.stringify(nomes)); } catch { /* armazenamento indisponível */ }
  estado = base();
  aviso = 'Nova lista carregada. O sorteio pode começar.';
  $('entrada-alunos').value = nomes.join('\n');
  status.textContent = `Lista carregada com sucesso: ${nomes.length} ${nomes.length === 1 ? 'aluno' : 'alunos'}.`;
  atualizarContagem();
  atualizar();
  mudarAba('sorteio');
});
atualizarContagem();
renderizar();
