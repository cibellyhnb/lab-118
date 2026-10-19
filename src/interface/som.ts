/*******************************************************************************
 * som.ts
 * funcao principal: efeitos sonoros curtos sintetizados na hora com a Web
 * Audio API (ondas quadradas, estilo 8 bits). nenhum arquivo de audio de
 * terceiros.
 ******************************************************************************/
// um contexto de audio so para o jogo todo, criado na primeira vez que precisar
let ctx: AudioContext | null = null;

// mesma razao do musica.ts: ao salvar este arquivo em desenvolvimento, recarrega
// a pagina para nao ficar com dois contextos de audio
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

/*******************************************************************************
 * audio
 * funcao: devolve o AudioContext do jogo, criando na primeira chamada.
 * recebe: nada.
 * retorna: o AudioContext, ou null no servidor ou em navegador sem audio.
 ******************************************************************************/
export function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    // Safari antigo so tem a versao com prefixo webkit
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/*******************************************************************************
 * bip
 * funcao: toca uma nota curta de onda quadrada que some aos poucos.
 * recebe: freq (Hz), inicio (segundos a partir de agora), dur (duracao em
 * segundos) e vol (volume, padrao 0.06).
 * retorna: nada.
 ******************************************************************************/
function bip(freq: number, inicio: number, dur: number, vol = 0.06) {
  const a = audio();
  if (!a) return;
  // o navegador suspende o audio ate a primeira interacao; tenta retomar
  if (a.state === "suspended") void a.resume();
  const t = a.currentTime + inicio;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  // volume cai rapido ate quase zero, para o som nao estalar no fim
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

/*******************************************************************************
 * sons
 * funcao: os efeitos sonoros do jogo, cada um uma sequencia de bips.
 * uso: sons.construir(), sons.estrela() etc., sempre passando por tocar()
 * do store para respeitar o botao de som.
 ******************************************************************************/
export const sons = {
  // soltar particula: cada tipo tem uma altura (p medio, n grave, e agudo)
  soltar(tipo: "p" | "n" | "e") {
    bip(tipo === "p" ? 660 : tipo === "n" ? 440 : 880, 0, 0.08);
  },
  // apertou CONSTRUIR
  construir() {
    bip(330, 0, 0.06);
    bip(495, 0.06, 0.08);
  },
  // ganhou estrela
  estrela() {
    bip(988, 0, 0.07);
    bip(1319, 0.07, 0.18);
  },
  // elemento novo: arpejo subindo
  descoberta() {
    [523, 659, 784, 1047].forEach((f, i) => bip(f, i * 0.09, 0.14, 0.07));
  },
  // "voz" do personagem: bips curtinhos e levemente variados enquanto o texto aparece
  fala(i: number) {
    bip(520 + ((i * 53) % 7) * 38, 0, 0.035, 0.025);
  },
  // passo do tutorial cumprido
  acerto() {
    bip(784, 0, 0.06, 0.05);
    bip(1175, 0.06, 0.12, 0.05);
  },
  // fanfarra da cerimonia de familia completa
  fanfarra() {
    [392, 523, 659, 784].forEach((f, i) => bip(f, i * 0.12, 0.16, 0.06));
    [1047, 988, 1047].forEach((f, i) => bip(f, 0.55 + i * 0.1, 0.12, 0.06));
    bip(1568, 0.9, 0.5, 0.07);
  },
  // resposta errada do quiz: suave, nada de bronca
  erro() {
    bip(330, 0, 0.09, 0.035);
    bip(262, 0.09, 0.16, 0.035);
  },
  // final do jogo: notas subindo, uma por elemento (escala pentatonica).
  // a cada 30 notas sobe uma oitava
  nota(i: number) {
    const graus = [0, 2, 4, 7, 9];
    const semitons = graus[i % 5]! + 12 * Math.floor(i / 30);
    bip(262 * 2 ** (semitons / 12), 0, 0.05, 0.022);
  },
  // final do jogo: estouro de fogos
  estouro() {
    bip(1319, 0, 0.04, 0.03);
    bip(880, 0.03, 0.08, 0.03);
    bip(1760, 0.07, 0.14, 0.025);
  },
  // passar o mouse num botao: um tique bem baixinho
  hover() {
    bip(1175, 0, 0.03, 0.018);
  },
  // clique num botao: dois toquinhos agradaveis
  clique() {
    bip(659, 0, 0.05, 0.04);
    bip(988, 0.05, 0.09, 0.04);
  },
  // mudou de tela
  pagina() {
    bip(392, 0, 0.05, 0.03);
    bip(523, 0.05, 0.05, 0.03);
    bip(784, 0.1, 0.1, 0.03);
  },
  // aparece um dialogo novo
  dialogo() {
    bip(392, 0, 0.05, 0.035);
  },
};
