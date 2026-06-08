-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_perfil` ENUM('adotante', 'doador') NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `cidade_uf` VARCHAR(100) NULL,
    `foto_perfil` LONGTEXT NULL,
    `nome_abrigo` VARCHAR(100) NULL,
    `tem_quintal` BOOLEAN NULL,
    `outros_pets` BOOLEAN NULL,
    `data_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `especie` ENUM('Cachorro', 'Gato') NOT NULL,
    `raca` VARCHAR(100) NOT NULL,
    `idade_desc` VARCHAR(50) NOT NULL,
    `sexo` ENUM('Macho', 'Femea') NOT NULL,
    `porte` ENUM('Pequeno', 'Medio', 'Grande') NOT NULL,
    `bio` TEXT NOT NULL,
    `localizacao` VARCHAR(100) NOT NULL,
    `foto` LONGTEXT NOT NULL,
    `adotado` BOOLEAN NOT NULL DEFAULT false,
    `data_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `doadorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `swipes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `acao` ENUM('like', 'pass', 'super') NOT NULL,
    `data_acao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `adotanteId` INTEGER NOT NULL,
    `petId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ultima_mensagem` TEXT NULL,
    `lida_adotante` BOOLEAN NOT NULL DEFAULT false,
    `lida_doador` BOOLEAN NOT NULL DEFAULT false,
    `status_visita` ENUM('nenhum', 'proposta_adotante', 'proposta_doador', 'agendada', 'agendado', 'adotado', 'cancelada', 'cancelado') NOT NULL DEFAULT 'nenhum',
    `data_visita` DATE NULL,
    `hora_visita` VARCHAR(10) NULL,
    `status_adocao` ENUM('nenhum', 'proposta_adotante', 'proposta_doador', 'agendada', 'agendado', 'adotado', 'cancelada', 'cancelado') NOT NULL DEFAULT 'nenhum',
    `data_adocao` DATE NULL,
    `hora_adocao` VARCHAR(10) NULL,
    `data_match` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `adotanteId` INTEGER NOT NULL,
    `petId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mensagens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `remetente` ENUM('user', 'pet') NOT NULL,
    `texto` TEXT NOT NULL,
    `data_envio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `matchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pets` ADD CONSTRAINT `pets_doadorId_fkey` FOREIGN KEY (`doadorId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `swipes` ADD CONSTRAINT `swipes_adotanteId_fkey` FOREIGN KEY (`adotanteId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `swipes` ADD CONSTRAINT `swipes_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_adotanteId_fkey` FOREIGN KEY (`adotanteId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensagens` ADD CONSTRAINT `mensagens_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
