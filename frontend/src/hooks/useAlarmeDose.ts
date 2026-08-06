import { useEffect, useRef, useCallback } from 'react';
import type { RegistroDose } from '../types/registroDose';

export function useAlarmeDose(
  registros: RegistroDose[],
  somUrl: string = '/alarme.mp3',
  duracaoAlarmeMs: number = 10000 // Toca por 10 segundos e para
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const timeoutSomRef = useRef<number | null>(null);
  // Mantém rastreio dos horários que já dispararam para não repeti-los em re-renders
  const horariosDisparadosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const audio = new Audio(somUrl);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [somUrl]);

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

  const tocarTemporizado = useCallback(() => {
    if (!audioRef.current) return;

    // Reinicia o áudio do começo e toca
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.warn('⚠️ O navegador bloqueou o áudio ou arquivo não encontrado:', err);
    });

    // Limpa qualquer temporizador de pausa pré-existente
    if (timeoutSomRef.current) {
      window.clearTimeout(timeoutSomRef.current);
    }

    // Programa a interrupção do som após os 10 segundos
    timeoutSomRef.current = window.setTimeout(() => {
      pararAlarme();
      console.log('⏱️ Alarme pausado automaticamente após 10 segundos.');
    }, duracaoAlarmeMs);
  }, [duracaoAlarmeMs, pararAlarme]);

  useEffect(() => {
    // Limpa temporizadores de agendamento anteriores
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    const pendentes = registros.filter((r) => r.status === 'PENDENTE');

    if (pendentes.length === 0) {
      pararAlarme();
      horariosDisparadosRef.current.clear();
      return;
    }

    const agora = new Date();

    pendentes.forEach((registro) => {
      const [horas, minutos] = registro.medicamento.horario.split(':').map(Number);
      const chaveHorario = `${registro.medicamento.id}-${registro.medicamento.horario}`;

      const alvo = new Date();
      alvo.setHours(horas, minutos, 0, 0);

      const tempoRestante = alvo.getTime() - agora.getTime();

      if (tempoRestante > 0) {
        // Agenda o disparo para o minuto exato do remédio
        const timerId = window.setTimeout(() => {
          tocarTemporizado();
          horariosDisparadosRef.current.add(chaveHorario);
        }, tempoRestante);

        timersRef.current.push(timerId);
      } else {
        // Se a hora já chegou/passou e ainda não disparou nesta sessão, toca por 10s
        if (!horariosDisparadosRef.current.has(chaveHorario)) {
          // Checa se passou menos de 1 minuto do horário original para tocar no carregamento
          if (Math.abs(tempoRestante) < 60000) {
            tocarTemporizado();
          }
          horariosDisparadosRef.current.add(chaveHorario);
        }
      }
    });

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, [registros, tocarTemporizado, pararAlarme]);

  return { pararAlarme };
}