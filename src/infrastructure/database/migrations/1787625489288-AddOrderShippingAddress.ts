import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddOrderShippingAddress1787625489288 implements MigrationInterface {
  name = 'AddOrderShippingAddress1787625489288';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_postal_code\` varchar(10) NULL`);
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_prefecture\` varchar(50) NULL`);
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_city\` varchar(100) NULL`);
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_street\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_building\` varchar(255) NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_building\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_street\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_city\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_prefecture\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_postal_code\``);
  }
}
