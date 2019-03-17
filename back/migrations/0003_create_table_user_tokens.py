"""
create table user_tokens
date created: 2019-03-17 11:20:47.095842
"""


def upgrade(migrator):
    with migrator.create_table('user_tokens') as table:
        table.primary_key('id')
        table.char('username', max_length=255)
        table.char('token', index=True, max_length=255)


def downgrade(migrator):
    migrator.drop_table('user_tokens')
