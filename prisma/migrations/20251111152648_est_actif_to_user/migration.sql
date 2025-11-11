/*
  Warnings:

  - Added the required column `estActif` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Disponibilite_medecinId_fkey` ON `disponibilite`;

-- DropIndex
DROP INDEX `RendezVous_medecinId_fkey` ON `rendezvous`;

-- DropIndex
DROP INDEX `Utilisateur_specialiteId_fkey` ON `utilisateur`;

-- AlterTable
ALTER TABLE `utilisateur` ADD COLUMN `estActif` BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_specialiteId_fkey` FOREIGN KEY (`specialiteId`) REFERENCES `Specialite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disponibilite` ADD CONSTRAINT `Disponibilite_medecinId_fkey` FOREIGN KEY (`medecinId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RendezVous` ADD CONSTRAINT `RendezVous_medecinId_fkey` FOREIGN KEY (`medecinId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
