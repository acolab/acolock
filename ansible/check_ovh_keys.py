# -*- encoding: utf-8 -*-
'''
First, install the latest release of Python wrapper: $ pip install ovh
'''
import json
import ovh
import subprocess
import yaml

result = subprocess.run(["ansible-vault", "view", "ansible/ovh_keys_admin.yml"], stdout=subprocess.PIPE)
keys_yaml = result.stdout
admin_keys = yaml.safe_load(keys_yaml)

result = subprocess.run(["ansible-vault", "view", "ansible/ovh_keys.yml"], stdout=subprocess.PIPE)
keys_yaml = result.stdout
app_keys = yaml.safe_load(keys_yaml)

client = ovh.Client(
    endpoint='ovh-eu',
    application_key=admin_keys["ovh_application_key"],
    application_secret=admin_keys["ovh_application_secret"],
    consumer_key=admin_keys["ovh_consumer_key"],
)

app_ids = client.get('/me/api/application')

for app_id in app_ids:
    # print(app_id)
    app = client.get('/me/api/application/' + str(app_id))
    if app["applicationKey"] == app_keys["ovh_application_key"]:
        # print(json.dumps(app, indent=4))
        credential_ids = client.get('/me/api/credential', applicationId=app_id)
        for credential_id in credential_ids:
            credential = client.get('/me/api/credential/' + str(credential_id))
            # print(json.dumps(credential, indent=4))
            if credential["expiration"] == None:
                print("OK : Le token OVH n'a pas de date d'expiration")
                exit(0)
            else:
                print("Erreur : Le token OVH expire: " + str(credential["expiration"]))
                exit(1)

print("Erreur : Token OVH non trouvé")
exit(2)
