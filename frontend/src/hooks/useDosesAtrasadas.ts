import { useEffect, useState, useCallback, useRef } from 'react';
import { buscarRegistrosDoDia, type PacienteVinculado } from '../services/api';

export interface DoseAtrasadaInfo {
    registroId: string;
    pacienteNome: string;
    medicamentoNome: string;
    horario: string;
}

function formatarDataParaApi(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

export function useDosesAtrasadas(pacientes: PacienteVinculado[], intervaloMs: number = 30000) {
    const [dosesAtrasadas, setDosesAtrasadas] = useState<DoseAtrasadaInfo[]>([]);
    const notificadosRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const verificarAtrasos = useCallback(async () => {
        if (!pacientes || pacientes.length === 0) {
            setDosesAtrasadas([]);
            return;
        }

        const hoje = formatarDataParaApi(new Date());

        try {
            const resultadosPorPaciente = await Promise.all(
                pacientes.map(async (paciente) => {
                    try {
                        const registros = await buscarRegistrosDoDia(paciente.id, hoje);

                        // BUGFIX: antes também considerava "atrasado" qualquer
                        // dose PENDENTE com horário já passado há 1 minuto —
                        // duplicava a regra de negócio do backend com um valor
                        // diferente dos 30 minutos definidos no
                        // redisSnoozeListener.ts. Agora confia inteiramente no
                        // status ATRASADO que já vem pronto da API (aplicado
                        // pelo Redis no horário certo), evitando que a tela do
                        // cuidador e o backend fiquem dessincronizados se o
                        // valor de tolerância mudar no futuro.
                        const atrasados = registros.filter(
                            (r) => r.status === 'ATRASADO'
                        );

                        return atrasados.map((r) => ({
                            registroId: r.id,
                            pacienteNome: paciente.nome,
                            medicamentoNome: r.medicamento.nome,
                            horario: r.medicamento.horario,
                        }));
                    } catch (err) {
                        console.error(`Erro ao buscar doses do paciente ${paciente.nome}:`, err);
                        return [];
                    }
                })
            );

            const todasAtrasadas = resultadosPorPaciente.flat();

            todasAtrasadas.forEach((item) => {
                const chaveNotificacao = item.registroId;
                if (!notificadosRef.current.has(chaveNotificacao)) {
                    notificadosRef.current.add(chaveNotificacao);

                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('⚠️ Dose Atrasada!', {
                            body: `${item.pacienteNome} não tomou ${item.medicamentoNome} marcado para às ${item.horario}.`,
                        });
                    }
                }
            });

            setDosesAtrasadas(todasAtrasadas);
        } catch (err) {
            console.error('Erro ao verificar atrasos gerais:', err);
        }
    }, [pacientes]);

    useEffect(() => {
        verificarAtrasos();

        const intervalId = setInterval(() => {
            verificarAtrasos();
        }, intervaloMs);

        return () => clearInterval(intervalId);
    }, [verificarAtrasos, intervaloMs]);

    return { dosesAtrasadas, recarregarAtrasos: verificarAtrasos };
}