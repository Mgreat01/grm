/*
  Warnings:

  - You are about to drop the column `symptome` on the `rendezvous` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nom]` on the table `Specialite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Disponibilite_medecinId_fkey` ON `disponibilite`;

-- DropIndex
DROP INDEX `RendezVous_medecinId_fkey` ON `rendezvous`;

-- DropIndex
DROP INDEX `Utilisateur_specialiteId_fkey` ON `utilisateur`;

-- AlterTable
ALTER TABLE `rendezvous` DROP COLUMN `symptome`;

-- AlterTable
ALTER TABLE `utilisateur` MODIFY `estActif` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Symptome` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Symptome_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SymptomeToSpecialite` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SymptomeToSpecialite_AB_unique`(`A`, `B`),
    INDEX `_SymptomeToSpecialite_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RdvToSymptomes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RdvToSymptomes_AB_unique`(`A`, `B`),
    INDEX `_RdvToSymptomes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Specialite_nom_key` ON `Specialite`(`nom`);

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_specialiteId_fkey` FOREIGN KEY (`specialiteId`) REFERENCES `Specialite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disponibilite` ADD CONSTRAINT `Disponibilite_medecinId_fkey` FOREIGN KEY (`medecinId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RendezVous` ADD CONSTRAINT `RendezVous_specialiteId_fkey` FOREIGN KEY (`specialiteId`) REFERENCES `Specialite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RendezVous` ADD CONSTRAINT `RendezVous_medecinId_fkey` FOREIGN KEY (`medecinId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SymptomeToSpecialite` ADD CONSTRAINT `_SymptomeToSpecialite_A_fkey` FOREIGN KEY (`A`) REFERENCES `Specialite`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SymptomeToSpecialite` ADD CONSTRAINT `_SymptomeToSpecialite_B_fkey` FOREIGN KEY (`B`) REFERENCES `Symptome`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RdvToSymptomes` ADD CONSTRAINT `_RdvToSymptomes_A_fkey` FOREIGN KEY (`A`) REFERENCES `RendezVous`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RdvToSymptomes` ADD CONSTRAINT `_RdvToSymptomes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Symptome`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
