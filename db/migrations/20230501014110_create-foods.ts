import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('foods', function (table) {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.timestamp('date').defaultTo(knex.fn.now()).notNullable()
    table.boolean('isDiet').defaultTo(true).notNullable()
    table.text('user_id').references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('foods')
}
