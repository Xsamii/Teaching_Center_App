import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetInitialIDValue1646766767000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Example SQL operations to set initial ID value
    await queryRunner.query(`ALTER TABLE student AUTO_INCREMENT = 1000`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert operations if needed
    await queryRunner.query(`ALTER TABLE student AUTO_INCREMENT = 1`);
  }
}
