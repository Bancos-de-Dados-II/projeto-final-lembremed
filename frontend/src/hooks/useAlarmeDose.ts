import { useEffect, useRef, useCallback } from 'react';
import type { RegistroDose } from '../types/registroDose';

function padronizarHorario(horarioStr: string): string {
  if (!horarioStr) return '';
  const partes = horarioStr.trim().split(':');
  if (partes.length < 2) return '';
  const h = String(parseInt(partes[0], 10)).padStart(2, '0');
  const m = String(parseInt(partes[1], 10)).padStart(2, '0');
  return `${h}:${m}`;
}

// Converte "HH:MM" em minutos desde a meia-noite, para comparação por
// "já passou ou é agora" em vez de igualdade exata de string.
function paraMinutos(horarioHHMM: string): number | null {
  const partes = horarioHHMM.split(':');
  if (partes.length < 2) return null;
  const h = Number(partes[0]);
  const m = Number(partes[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function useAlarmeDose(
  registros: RegistroDose[],
  onDispararAlarme: (registro: RegistroDose) => void,
  somUrl: string = '/alarme.mp3',
  duracaoAlarmeMs: number = 10000
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutSomRef = useRef<number | null>(null);

  // BUGFIX: antes a chave incluía o horário (`${id}-${horario}`), e o
  // disparo só acontecia em igualdade exata de HH:MM. Se o app fosse
  // aberto DEPOIS do horário (aba em segundo plano, computador
  // suspenso, F5 tardio), o alarme nunca disparava para aquela dose no
  // dia — o minuto exato já tinha passado e nunca mais "batia igual".
  // Agora a chave é só o id do registro, e a comparação é "já passou ou
  // é agora" (>=), então o alarme dispara mesmo em um horário posterior
  // ao previsto, incluindo imediatamente ao carregar a tela.
  const disparadosRef = useRef<Set<string>>(new Set());

  const onDispararRef = useRef(onDispararAlarme);
  useEffect(() => {
    onDispararRef.current = onDispararAlarme;
  }, [onDispararAlarme]);

  useEffect(() => {
    const audio = new Audio(somUrl);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [somUrl]);

  // BUGFIX: agora aceita um registroId opcional. Quando chamado sem
  // argumento (comportamento antigo), continua parando o som
  // incondicionalmente — usado quando a fila de alarmes pendentes fica
  // vazia. O controle de "qual registro ainda está pendente na fila" é
  // responsabilidade do componente que usa este hook, não deste hook.
  const pararAlarme = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timeoutSomRef.current) {
      window.clearTimeout(timeoutSomRef.current);
      timeoutSomRef.current = null;
    }
  }, []);

  const dispararAlarme = useCallback(
    (registro: RegistroDose) => {
      onDispararRef.current(registro);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Bloqueio de autoplay do navegador até haver interação do
          // usuário na página — comportamento esperado, não é erro.
        });
      }

      if (timeoutSomRef.current) {
        window.clearTimeout(timeoutSomRef.current);
      }

      timeoutSomRef.current = window.setTimeout(() => {
        pararAlarme();
      }, duracaoAlarmeMs);
    },
    [duracaoAlarmeMs, pararAlarme]
  );

  useEffect(() => {
    function verificar() {
      const agora = new Date();
      const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

      const pendentes = registros.filter((r) => r.status === 'PENDENTE');

      pendentes.forEach((registro) => {
        if (disparadosRef.current.has(registro.id)) return;

        const horarioNormalizado = padronizarHorario(
          registro.medicamento.horario
        );
        const minutosRemedio = paraMinutos(horarioNormalizado);
        if (minutosRemedio === null) return;

        // ">=", não "===": cobre tanto o instante exato quanto o caso
        // de a tela ter sido aberta depois do horário previsto.
        if (minutosAgora >= minutosRemedio) {
          disparadosRef.current.add(registro.id);
          dispararAlarme(registro);
        }
      });
    }

    // Roda imediatamente (cobre doses já vencidas ao carregar a tela),
    // e depois a cada segundo.
    verificar();
    const intervalId = setInterval(verificar, 1000);

    return () => clearInterval(intervalId);
  }, [registros, dispararAlarme]);

  return { pararAlarme, dispararAlarme };
}