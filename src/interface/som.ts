// Sons curtos sintetizados (ondas quadradas). Nenhum arquivo de terceiros.
let ctx: AudioContext | null = null;

// Mesma razão do musica.ts: ao salvar este arquivo em desenvolvimento, recarrega para não ficar com dois contextos de áudio.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

export function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function bip(freq: number, inicio: number, dur: number, vol = 0.06) {
  const a = audio();
  if (!a) return;
  if (a.state === "suspended") void a.resume();
  const t = a.currentTime + inicio;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

export const sons = {
  soltar(tipo: "p" | "n" | "e") {
    bip(tipo === "p" ? 660 : tipo === "n" ? 440 : 880, 0, 0.08);
  },
  construir() {
    bip(330, 0, 0.06);
    bip(495, 0.06, 0.08);
  },
  estrela() {
    bip(988, 0, 0.07);
    bip(1319, 0.07, 0.18);
  },
  descoberta() {
    [523, 659, 784, 1047].forEach((f, i) => bip(f, i * 0.09, 0.14, 0.07));
  },
  /** "Voz" do personagem: bips curtinhos e levemente variados enquanto o texto aparece. */
  fala(i: number) {
    bip(520 + ((i * 53) % 7) * 38, 0, 0.035, 0.025);
  },
  /** Passo do tutorial cumprido. */
  acerto() {
    bip(784, 0, 0.06, 0.05);
    bip(1175, 0.06, 0.12, 0.05);
  },
  /** Fanfarra da cerimônia de família completa. */
  fanfarra() {
    [392, 523, 659, 784].forEach((f, i) => bip(f, i * 0.12, 0.16, 0.06));
    [1047, 988, 1047].forEach((f, i) => bip(f, 0.55 + i * 0.1, 0.12, 0.06));
    bip(1568, 0.9, 0.5, 0.07);
  },
  /** Resposta errada do quiz: suave, nada de bronca. */
  erro() {
    bip(330, 0, 0.09, 0.035);
    bip(262, 0.09, 0.16, 0.035);
  },
  /** Final do jogo: notas subindo, uma por elemento (escala pentatônica). */
  nota(i: number) {
    const graus = [0, 2, 4, 7, 9];
    const semitons = graus[i % 5]! + 12 * Math.floor(i / 30);
    bip(262 * 2 ** (semitons / 12), 0, 0.05, 0.022);
  },
  /** Final do jogo: estouro de fogos. */
  estouro() {
    bip(1319, 0, 0.04, 0.03);
    bip(880, 0.03, 0.08, 0.03);
    bip(1760, 0.07, 0.14, 0.025);
  },
  /** Passar o mouse num botão: um tique bem baixinho. */
  hover() {
    bip(1175, 0, 0.03, 0.018);
  },
  /** Clique num botão: dois toquinhos agradáveis. */
  clique() {
    bip(659, 0, 0.05, 0.04);
    bip(988, 0.05, 0.09, 0.04);
  },
  /** Mudou de tela. */
  pagina() {
    bip(392, 0, 0.05, 0.03);
    bip(523, 0.05, 0.05, 0.03);
    bip(784, 0.1, 0.1, 0.03);
  },
  /** Aparece um diálogo novo. */
  dialogo() {
    bip(392, 0, 0.05, 0.035);
  },
};
