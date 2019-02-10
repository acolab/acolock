def upgrade(migrator):
    migrator.add_column('user_actions', 'json_data', 'text', null=True)

def downgrade(migrator):
    migrator.drop_column('user_actions', 'json_data')
