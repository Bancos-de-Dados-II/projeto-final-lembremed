import mongoose, { Schema, Document } from 'mongoose';

// Subdocumento GeoJSON Point / mesmo padrão utilizado em PontoSaudeMapa.ts
interface Localizacao {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

// Interface do documento, para tipagem no restante da aplicação
export interface IAlertaEmergencia extends Document {
    pacienteId: string;
    status: string;
    localizacao: Localizacao;
    dataHoraAcionamento: Date;
    createdAt: Date;
    updatedAt: Date;
}

const LocalizacaoSchema = new Schema<Localizacao>(
    {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    { _id: false } // subdocumento não precisa de _id
);

const AlertaEmergenciaSchema = new Schema<IAlertaEmergencia>(
    {
        pacienteId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: 'ativo', // status inicial do alerta
        },
        localizacao: {
            type: LocalizacaoSchema,
            required: true,
        },
        dataHoraAcionamento: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true, // createdAt e updatedAt automáticos
    }
);

// Indice geoespacial 2dsphere para futuras queries com $near/$geoWithin
AlertaEmergenciaSchema.index({ localizacao: '2dsphere' });

// Evita o erro "OverwriteModelError" em ambientes com hot-reload (tsx watch)"
export const AlertaEmergencia =
    mongoose.models.AlertaEmergencia ||
    mongoose.model<IAlertaEmergencia>('AlertaEmergencia', AlertaEmergenciaSchema);