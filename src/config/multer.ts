import multer from 'multer';
import path from 'path';

// Configura onde e com que nome os arquivos serão salvos
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    // Nome único: timestamp + extensão original, evita sobrescrever arquivos
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    callback(null, nomeUnico);
  },
});

// Aceita apenas imagens (fotos de remédio) e PDFs (receitas)
const filtroDeArquivo = (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const tiposPermitidos = /jpeg|jpg|png|pdf/;
  const extensaoValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimeTypeValido = tiposPermitidos.test(file.mimetype);

  if (extensaoValida && mimeTypeValido) {
    callback(null, true);
  } else {
    callback(new Error('Tipo de arquivo não permitido. Use apenas JPG, PNG ou PDF.'));
  }
};

export const upload = multer({
  storage,
  fileFilter: filtroDeArquivo,
  limits: { fileSize: 5 * 1024 * 1024 }, // limite de 5MB por arquivo
});