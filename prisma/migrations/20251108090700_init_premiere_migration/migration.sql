-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `noms_complet` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `specialiteId` INTEGER NULL,

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Specialite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Disponibilite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medecinId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `heure_debut` VARCHAR(191) NOT NULL,
    `heure_fin` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RendezVous` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `nom_patient` VARCHAR(191) NOT NULL,
    `email_patient` VARCHAR(191) NOT NULL,
    `numero_patient` VARCHAR(191) NOT NULL,
    `symptome` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'en_attente',
    `presence` BOOLEAN NULL DEFAULT false,
    `date_rdv` DATETIME(3) NULL,
    `heure_rdv` DATETIME(3) NULL,
    `specialiteId` INTEGER NULL,
    `medecinId` INTEGER NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RendezVous_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Utilisateur` ADD CONSTRAINT `Utilisateur_specialiteId_fkey` FOREIGN KEY (`specialiteId`) REFERENCES `Specialite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disponibilite` ADD CONSTRAINT `Disponibilite_medecinId_fkey` FOREIGN KEY (`medecinId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RendezVous` ADD CONSTRAINT `RendezVous_medecinId_fkey` FOREIGN KEY (`medecinId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
