#!/bin/bash
gpg --batch --use-agent --decrypt $(dirname $0)/vault_passphrase.gpg
