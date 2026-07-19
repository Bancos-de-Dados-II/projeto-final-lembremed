/*
  Warnings:

  - Added the required column `papel` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "foto_perfil_url" TEXT,
ADD COLUMN     "latitude_atual" DOUBLE PRECISION,
ADD COLUMN     "longitude_atual" DOUBLE PRECISION,
ADD COLUMN     "papel" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT;

-- AlterTable
ALTER TABLE "Vinculo_Cuidado" ADD COLUMN     "nivel_acesso" TEXT DEFAULT 'TOTAL';
