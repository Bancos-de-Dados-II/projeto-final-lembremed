-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vinculo_Cuidado" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "cuidadorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vinculo_Cuidado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vinculo_Cuidado_pacienteId_cuidadorId_key" ON "Vinculo_Cuidado"("pacienteId", "cuidadorId");

-- AddForeignKey
ALTER TABLE "Vinculo_Cuidado" ADD CONSTRAINT "Vinculo_Cuidado_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinculo_Cuidado" ADD CONSTRAINT "Vinculo_Cuidado_cuidadorId_fkey" FOREIGN KEY ("cuidadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
