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

export function useAlarmeDose(
  registros: RegistroDose[],
  onDispararAlarme: (registro: RegistroDose) => void,
  somUrl: string = '/alarme.mp3',
  duracaoAlarmeMs: number = 10000
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutSomRef = useRef<number | null>(null);
  const disparadosRef = useRef<Set<string>>(new Set());

  // Guardamos o callback mais recente em ref para não reiniciar o setInterval a cada render
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

  const pararAlarme = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('🛑 Alarme pausado.');
    }
    if (timeoutSomRef.current) {
      window.clearTimeout(timeoutSomRef.current);
      timeoutSomRef.current = null;
    }
  }, []);

  const dispararAlarme = useCallback(
    (registro: RegistroDose) => {
      console.log(`⏰ DISPARANDO ALARME: ${registro.medicamento.nome} (${registro.medicamento.horario})`);

      // Notifica o componente pai
      onDispararRef.current(registro);

      // Toca o som
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn('⚠️ Áudio bloqueado pelo navegador até interação:', err);
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

  // Monitoramento contínuo sem reinicialização indevida
  useEffect(() => {
    const intervalId = setInterval(() => {
      const agora = new Date();
      const horaAtual = String(agora.getHours()).padStart(2, '0');
      const minutoAtual = String(agora.getMinutes()).padStart(2, '0');
      const horarioAtualFormatado = `${horaAtual}:${minutoAtual}`;

      const pendentes = registros.filter((r) => r.status === 'PENDENTE');

      pendentes.forEach((registro) => {
        const horarioNormalizado = padronizarHorario(registro.medicamento.horario);
        const chaveDisparo = `${registro.id}-${horarioNormalizado}`;

        if (horarioNormalizado === horarioAtualFormatado && !disparadosRef.current.has(chaveDisparo)) {
          disparadosRef.current.add(chaveDisparo);
          dispararAlarme(registro);
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [registros, dispararAlarme]);

  return { pararAlarme, dispararAlarme };
}