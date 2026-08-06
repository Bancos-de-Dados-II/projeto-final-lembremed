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

    // Solicita permissão para notificações do navegador ao carregar
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
        const agora = new Date();
        const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();

        try {
            const resultadosPorPaciente = await Promise.all(
                pacientes.map(async (paciente) => {
                    try {
                        const registros = await buscarRegistrosDoDia(paciente.id, hoje);

                        console.log(`🔍 [Diagnóstico] Registros recebidos de ${paciente.nome}:`, registros);

                        // Considera atrasado se o status da API for ATRASADO
                        // OU se ainda estiver PENDENTE mas o horário do remédio já tiver passado no relógio
                        const atrasados = registros.filter((r) => {
                            if (r.status === 'ATRASADO') return true;

                            if (r.status === 'PENDENTE' && r.medicamento?.horario) {
                                const [h, m] = r.medicamento.horario.split(':').map(Number);
                                const horaRemedioMinutos = h * 60 + m;
                                // Se a hora do remédio já passou há mais de 1 minuto
                                return horaAtualMinutos > horaRemedioMinutos;
                            }

                            return false;
                        });

                        return atrasados.map((r) => ({
                            registroId: r.id,
                            pacienteNome: paciente.nome,
                            medicamentoNome: r.medicamento.nome,
                            horario: r.medicamento.horario,
                            status: r.status
                        }));
                    } catch (err) {
                        console.error(`Erro ao buscar doses do paciente ${paciente.nome}:`, err);
                        return [];
                    }
                })
            );

            const todasAtrasadas = resultadosPorPaciente.flat();
            console.log('🚨 [Diagnóstico] Total de doses atrasadas agrupadas:', todasAtrasadas);

            // Dispara as notificações nativas
            todasAtrasadas.forEach((item) => {
                const chaveNotificacao = `${item.registroId}`;
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