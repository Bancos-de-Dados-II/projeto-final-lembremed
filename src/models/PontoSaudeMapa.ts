import mongoose, { Schema, Document } from 'mongoose';

// Subdocumento GeoJSON Point - padrão exigido pelo MongoDB para armazenar coordenadas geoespaciais
interface Localizacao {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

// Interface do documento, para tipagem no restante da aplicação
export interface IPontoSaudeMapa extends Document {
    nome: string;
    tipo: string;
    endereco: string;
    localizacao: Localizacao;
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

const PontoSaudeMapaSchema = new Schema<IPontoSaudeMapa>(
    {
        nome: {
            type: String,
            required: true,
        },
        tipo: {
            type: String,
            required: true,
        },
        endereco: {
            type: String,
            required: true,
        },
        localizacao: {
            type: LocalizacaoSchema,
            required: true,
        },
    },
    {
        timestamps: true, // createdAt e updatedAt automáticos
    }
);

// Indice geoespacial 2dsphere, necessário para futuras queries com $near/$geoWithin
PontoSaudeMapaSchema.index({ localizacao: '2dsphere' });

// Evita o erro "OverwriteModelError" em ambientes com hot-reload (tsx watch)
export const PontoSaudeMapa =
    mongoose.models.PontoSaudeMapa ||
    mongoose.model<IPontoSaudeMapa>('PontoSaudeMapa', PontoSaudeMapaSchema);
