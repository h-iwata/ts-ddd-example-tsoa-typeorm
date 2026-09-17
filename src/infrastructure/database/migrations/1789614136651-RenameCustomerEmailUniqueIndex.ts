import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameCustomerEmailUniqueIndex1789614136651 implements MigrationInterface {
  name = 'RenameCustomerEmailUniqueIndex1789614136651';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`customers\` RENAME INDEX \`IDX_8536b8b85c06969f84f0c098b0\` TO \`UQ_customers_email\``);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`customers\` RENAME INDEX \`UQ_customers_email\` TO \`IDX_8536b8b85c06969f84f0c098b0\``);
  }
}
