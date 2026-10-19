/*******************************************************************************
 * musica.ts
 * funcao principal: musica de fundo 8 bits gerada em codigo com a Web Audio
 * API. as trilhas sao originais e curtas, feitas so de ondas de pulso,
 * triangular e ruido; nenhum arquivo de audio nem melodia de terceiros.
 ******************************************************************************/
import { audio } from "./som";

// trilhas disponiveis; cada tela pede uma pelo useMusica
export type Trilha = "historia" | "laboratorio" | "ambiente";

type Nota = number | null; // numero MIDI ou pausa
// converte numero MIDI em frequencia (69 = la de 440 Hz)
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

type Definicao = {
  bpm: number; // cada passo e uma colcheia
  melodia: Nota[];
  baixo: Nota[];
  acordes: number[][]; // um acorde por compasso (8 passos)
  arpejo: boolean;
  bateria: boolean;
  // trilha suave: acordes longos (pad) com eco, melodia esparsa e volume baixo
  suave?: boolean;
  // chiado leve no contratempo (sem bumbo)
  chiado?: boolean;
  // multiplicador de volume da trilha (1 = normal)
  vol?: number;
};

// trilha da historia: la menor, calma e misteriosa, terminando mais esperancosa (Am - F - C - G).
// melodia e baixo tem 8 passos por compasso, 4 compassos
const HISTORIA: Definicao = {
  bpm: 84,
  arpejo: true,
  bateria: false,
  acordes: [
    [57, 60, 64],
    [53, 57, 60],
    [48, 52, 55],
    [55, 59, 62],
  ],
  melodia: [
    76, null, null, 72, null, null, 69, null,
    69, null, null, 72, null, null, 77, null,
    76, null, null, 79, null, null, 76, null,
    74, null, 71, null, 74, null, 79, null,
  ],
  baixo: [
    45, null, null, null, 45, null, null, null,
    41, null, null, null, 41, null, null, null,
    36, null, null, null, 36, null, null, null,
    43, null, null, null, 43, null, null, null,
  ],
};

// trilha do laboratorio: do maior, animada (C - G - Am - F), com bateria de ruido
const LABORATORIO: Definicao = {
  bpm: 124,
  arpejo: false,
  bateria: true,
  acordes: [
    [60, 64, 67],
    [55, 59, 62],
    [57, 60, 64],
    [53, 57, 60],
  ],
  melodia: [
    76, null, 79, null, 76, 72, 74, 76,
    74, null, 71, null, 74, 79, 77, 74,
    72, null, 76, null, 81, 79, 76, 72,
    77, 76, 74, 72, 74, 76, 79, null,
  ],
  baixo: [
    48, null, 48, null, 55, null, 48, null,
    43, null, 43, null, 50, null, 43, null,
    45, null, 45, null, 52, null, 45, null,
    41, null, 41, null, 48, null, 41, null,
  ],
};


// trilha ambiente (fundo do jogo todo): aconchegante e alegre, mas baixinha para nao cansar.
// do maior, 104 bpm, 8 compassos (C - Am - F - G - C - Em - F - G): arpejo suave,
// melodia pentatonica saltitante e um chiado leve no contratempo
const AMBIENTE: Definicao = {
  bpm: 104,
  arpejo: true,
  bateria: false,
  chiado: true,
  vol: 0.75,
  acordes: [
    [60, 64, 67],
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
    [60, 64, 67],
    [52, 55, 59],
    [53, 57, 60],
    [55, 59, 62],
  ],
  melodia: [
    76, null, 79, null, 81, 79, null, 76,
    79, null, 76, null, 72, null, 74, 76,
    77, null, 81, null, 79, null, 77, 74,
    74, null, 79, null, 83, 81, 79, null,
    76, null, 79, null, 84, null, 81, 79,
    79, null, 76, null, 71, null, 74, 76,
    77, null, 81, null, 84, 81, 79, 77,
    79, null, 74, null, 76, 74, 71, null,
  ],
  // baixo gerado: para cada nota raiz, o padrao raiz, quinta, raiz, quinta no compasso
  baixo: [48, 45, 41, 43, 48, 40, 41, 43].flatMap((r) => [r, null, r + 7, null, r, null, r + 7, null] as Nota[]),
};

// liga o nome de cada trilha a sua definicao
const TRILHAS: Record<Trilha, Definicao> = { historia: HISTORIA, laboratorio: LABORATORIO, ambiente: AMBIENTE };

/*******************************************************************************
 * onda
 * funcao: cria uma onda de pulso com ciclo de trabalho d, somando 48
 * harmonicos (serie de Fourier). d = 0,25 da o som classico de 8 bits.
 * recebe: a (AudioContext) e d (entre 0 e 1).
 * retorna: a PeriodicWave pronta para usar num oscilador.
 ******************************************************************************/
function onda(a: AudioContext, d: number): PeriodicWave {
  const N = 48;
  const real = new Float32Array(N);
  const imag = new Float32Array(N);
  for (let n = 1; n < N; n++) {
    real[n] = Math.sin(2 * Math.PI * n * d) / (n * Math.PI);
    imag[n] = (1 - Math.cos(2 * Math.PI * n * d)) / (n * Math.PI);
  }
  return a.createPeriodicWave(real, imag);
}

/*******************************************************************************
 * Player
 * funcao: tocador de musica. agenda as notas um pouco a frente do tempo
 * atual (a cada 30 ms) para a musica nao engasgar, e liga/desliga o volume
 * sem perder o ponto da musica.
 ******************************************************************************/
class Player {
  private a: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private passo = 0;
  private proximo = 0;
  private trilha: Trilha | null = null;
  private ligada = true;
  private pulso25: PeriodicWave | null = null;
  private pulso50: PeriodicWave | null = null;
  private ruido: AudioBuffer | null = null;
  private eco: GainNode | null = null;
  private volTrilha = 1;

  // qual trilha esta tocando agora, ou null
  tocando(): Trilha | null {
    return this.timer !== null ? this.trilha : null;
  }

  /*****************************************************************************
   * preparar
   * funcao: monta os nos de audio na primeira vez (volume geral, eco, ondas
   * de pulso e o buffer de ruido da bateria).
   * recebe: nada.
   * retorna: false se nao houver audio no navegador.
   ****************************************************************************/
  private preparar(): boolean {
    const a = audio();
    if (!a) return false;
    // so remonta se o contexto de audio for novo
    if (!this.a || this.a !== a) {
      this.a = a;
      this.master = a.createGain();
      this.master.gain.value = this.ligada ? 0.9 : 0;
      this.master.connect(a.destination);
      // eco suave (usado so pelas trilhas com suave: true): atraso com realimentacao
      // e filtro que escurece cada repeticao
      const atraso = a.createDelay(1.5);
      atraso.delayTime.value = 0.7;
      const volta = a.createGain();
      volta.gain.value = 0.38;
      const filtro = a.createBiquadFilter();
      filtro.type = "lowpass";
      filtro.frequency.value = 1800;
      this.eco = a.createGain();
      this.eco.gain.value = 0.6;
      this.eco.connect(atraso);
      atraso.connect(filtro);
      filtro.connect(volta);
      volta.connect(atraso);
      filtro.connect(this.master);
      this.pulso25 = onda(a, 0.25);
      this.pulso50 = onda(a, 0.5);
      // 0,1 s de ruido branco para o chiado e a bateria
      const len = Math.floor(a.sampleRate * 0.1);
      this.ruido = a.createBuffer(1, len, a.sampleRate);
      const d = this.ruido.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return true;
  }

  /*****************************************************************************
   * iniciar
   * funcao: comeca a tocar a trilha do inicio. se ela ja estiver tocando, so
   * retoma o audio. precisa vir depois de um toque ou clique do jogador
   * (regra de autoplay dos navegadores).
   * recebe: trilha (Trilha).
   * retorna: nada.
   ****************************************************************************/
  iniciar(trilha: Trilha) {
    if (!this.preparar() || !this.a) return;
    if (this.timer !== null && this.trilha === trilha) {
      void this.a.resume();
      return;
    }
    this.parar();
    void this.a.resume();
    this.trilha = trilha;
    this.passo = 0;
    // primeira nota sai 80 ms depois, para dar tempo de agendar
    this.proximo = this.a.currentTime + 0.08;
    this.timer = window.setInterval(() => this.agendar(), 30);
  }

  /*****************************************************************************
   * parar
   * funcao: para de agendar notas (as ja agendadas terminam sozinhas).
   * recebe: nada. retorna: nada.
   ****************************************************************************/
  parar() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.trilha = null;
  }

  /*****************************************************************************
   * definirLigada
   * funcao: liga ou desliga o volume sem perder o ponto da musica.
   * recebe: ligada (boolean).
   * retorna: nada.
   ****************************************************************************/
  definirLigada(ligada: boolean) {
    this.ligada = ligada;
    // setTargetAtTime faz o volume mudar suave, sem estalo
    if (this.master && this.a) this.master.gain.setTargetAtTime(ligada ? 0.9 : 0, this.a.currentTime, 0.05);
  }

  /*****************************************************************************
   * agendar
   * funcao: chamada a cada 30 ms; agenda todas as notas que caem nos
   * proximos 0,4 s.
   * recebe: nada. retorna: nada.
   ****************************************************************************/
  private agendar() {
    const a = this.a;
    if (!a || !this.trilha) return;
    const t = TRILHAS[this.trilha];
    this.volTrilha = t.vol ?? 1;
    // duracao de uma colcheia em segundos
    const dur = 60 / t.bpm / 2;
    // se o navegador travou a aba por um tempo (aba em segundo plano, tela pesada),
    // nao despeja as notas atrasadas de uma vez
    if (this.proximo < a.currentTime - 0.25) this.proximo = a.currentTime + 0.05;
    while (this.proximo < a.currentTime + 0.4) {
      this.tocarPasso(t, this.passo % t.melodia.length, this.proximo, dur);
      this.proximo += dur;
      this.passo++;
    }
  }

  /*****************************************************************************
   * nota
   * funcao: toca uma nota com ataque curto e queda ate o silencio.
   * recebe: freq (Hz), ini (momento de inicio), dur (segundos), vol, tipo de
   * onda (pulso 25%, pulso 50% ou triangular), ataque (segundos) e eco
   * (se tambem manda o som para o eco).
   * retorna: nada.
   ****************************************************************************/
  private nota(freq: number, ini: number, dur: number, vol: number, tipo: "p25" | "p50" | "tri", ataque = 0.008, eco = false) {
    const a = this.a;
    if (!a || !this.master) return;
    const o = a.createOscillator();
    const g = a.createGain();
    if (tipo === "tri") o.type = "triangle";
    else o.setPeriodicWave((tipo === "p25" ? this.pulso25 : this.pulso50)!);
    o.frequency.setValueAtTime(freq, ini);
    g.gain.setValueAtTime(0.0001, ini);
    g.gain.linearRampToValueAtTime(vol * this.volTrilha, ini + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    o.connect(g).connect(this.master);
    if (eco && this.eco) g.connect(this.eco);
    o.start(ini);
    o.stop(ini + dur + 0.02);
  }

  /*****************************************************************************
   * bateria
   * funcao: toca uma batida: bumbo (triangular caindo de 150 para 45 Hz) ou
   * chiado (ruido filtrado so nos agudos).
   * recebe: ini (momento de inicio) e tipo ("bumbo" ou "chiado").
   * retorna: nada.
   ****************************************************************************/
  private bateria(ini: number, tipo: "bumbo" | "chiado") {
    const a = this.a;
    if (!a || !this.master) return;
    if (tipo === "bumbo") {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(150, ini);
      o.frequency.exponentialRampToValueAtTime(45, ini + 0.12);
      g.gain.setValueAtTime(0.1, ini);
      g.gain.exponentialRampToValueAtTime(0.0001, ini + 0.14);
      o.connect(g).connect(this.master);
      o.start(ini);
      o.stop(ini + 0.16);
      return;
    }
    // chiado
    const src = a.createBufferSource();
    src.buffer = this.ruido;
    const f = a.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 6000;
    const g = a.createGain();
    g.gain.setValueAtTime(0.025 * this.volTrilha, ini);
    g.gain.exponentialRampToValueAtTime(0.0001, ini + 0.04);
    src.connect(f).connect(g).connect(this.master);
    src.start(ini);
    src.stop(ini + 0.06);
  }

  /*****************************************************************************
   * tocarPasso
   * funcao: toca tudo o que cai num passo da trilha: melodia, baixo, acordes
   * ou arpejo e bateria.
   * recebe: t (Definicao), i (indice do passo), ini (momento de inicio) e dur
   * (duracao de um passo).
   * retorna: nada.
   ****************************************************************************/
  private tocarPasso(t: Definicao, i: number, ini: number, dur: number) {
    // modo suave: notas longas com eco e um acorde inteiro no inicio de cada compasso
    if (t.suave) {
      const m = t.melodia[i];
      if (m != null) this.nota(hz(m), ini, dur * 4, 0.03, "p50", 0.05, true);
      const b = t.baixo[i];
      if (b != null) this.nota(hz(b), ini, dur * 8, 0.07, "tri", 0.25);
      if (i % 8 === 0) {
        const acorde = t.acordes[Math.floor(i / 8) % t.acordes.length]!;
        for (const n of acorde) this.nota(hz(n), ini, dur * 8.5, 0.022, "tri", 0.6, true);
      }
      return;
    }
    // modo normal: melodia em pulso 25% e baixo triangular
    const m = t.melodia[i];
    if (m != null) this.nota(hz(m), ini, dur * 1.8, 0.055, "p25");
    const b = t.baixo[i];
    if (b != null) this.nota(hz(b), ini, dur * 3.4, 0.11, "tri");
    // arpejo: sobe e desce pelas notas do acorde do compasso, uma oitava acima
    if (t.arpejo) {
      const acorde = t.acordes[Math.floor(i / 8) % t.acordes.length]!;
      const ordem = [0, 1, 2, 1, 0, 1, 2, 1][i % 8]!;
      this.nota(hz(acorde[ordem]! + 12), ini, dur * 0.9, 0.022, "p50");
    }
    // bumbo a cada 4 passos e chiado nos contratempos
    if (t.bateria) {
      if (i % 4 === 0) this.bateria(ini, "bumbo");
      if (i % 2 === 1) this.bateria(ini, "chiado");
    }
    if (t.chiado && i % 2 === 1) this.bateria(ini, "chiado");
  }
}

/*******************************************************************************
 * musica
 * funcao: o unico tocador do jogo, usado pelo useMusica.
 ******************************************************************************/
export const musica = new Player();

// em desenvolvimento, ao salvar este arquivo o Vite criaria um segundo player (o antigo
// continuaria tocando sem controle); por isso recarrega a pagina
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());
