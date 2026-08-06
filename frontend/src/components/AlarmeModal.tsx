import React from 'react';
import ReactDOM from 'react-dom';
import type { RegistroDose } from '../types/registroDose';

interface AlarmeModalProps {
    registro: RegistroDose | null;
    onConfirmar: (id: string) => void;
    onFechar: () => void;
}

export const AlarmeModal: React.FC<AlarmeModalProps> = ({ registro, onConfirmar, onFechar }) => {
    if (!registro) return null;

    const modalConteudo = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    color: '#18181b'
                }}
            >
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>⏰</div>

                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#000000' }}>
                    Hora do Medicamento!
                </h2>
                <p style={{ fontSize: '14px', color: '#71717a', margin: 0 }}>
                    Está na hora de tomar a seguinte dose:
                </p>

                <div
                    style={{
                        margin: '20px 0',
                        padding: '16px',
                        backgroundColor: '#f4f4f5',
                        borderRadius: '12px',
                        border: '1px solid #e4e4e7'
                    }}
                >
                    {registro.medicamento.foto_url && (
                        <img
                            src={registro.medicamento.foto_url}
                            alt={registro.medicamento.nome}
                            style={{ width: '96px', height: '96px', objectFit: 'contain', margin: '0 auto 12px auto', display: 'block' }}
                        />
                    )}
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#4f46e5', margin: '0 0 4px 0' }}>
                        {registro.medicamento.nome}
                    </h3>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#27272a', margin: '4px 0' }}>
                        Horário: {registro.medicamento.horario}
                    </p>
                    <p style={{ fontSize: '14px', color: '#52525b', margin: '4px 0' }}>
                        Dose: {registro.medicamento.dosagem || 'Conforme indicação médica'}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={() => onConfirmar(registro.id)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        ✓ Marcar como Tomado
                    </button>

                    <button
                        type="button"
                        onClick={onFechar}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#e4e4e7',
                            color: '#3f3f46',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Silenciar Alarme
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalConteudo, document.body);
};