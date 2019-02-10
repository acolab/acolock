"""
create table user_actions
date created: 2019-02-10 09:58:15.820389
"""


def upgrade(migrator):
    with migrator.create_table('user_actions') as table:
        table.primary_key('id')
        table.char('username', index=True, max_length=255)
        table.datetime('time')
        table.char('action', max_length=255)


def downgrade(migrator):
    migrator.drop_table('user_actions')
