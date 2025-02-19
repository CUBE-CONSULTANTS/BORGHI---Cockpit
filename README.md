# BORGHI --- Cockpit
Passaggi per bootstrap da locale

- autenticazione su cloud foundry da terminale:
    cf login -a https://api.cf.eu10-004.hana.ondemand.com
- se non presente default-env.json o con credenziali obsolete, a seconda dell'ambiente di esecuzione, da terminale:
   Bash/zsh: eseguire il comando da terminale nella root del progetto cockpit:
              cf env cap-cockpit-srv | sed -n '/VCAP_SERVICES/,/VCAP_APPLICATION/p' |  sed '$d' |  sed '1s;^;{\n;' | sed '$s/$/}/' > default-env.json
             nel file default-env.json creato, racchiudere VCAP_SERVICES tra doppi apici
   Windows: cf env cap-cockpit-srv -> copiare VCAP_SERVICES e il suo contenuto -> creare default-env.json nella root del progetto cockpit -> incollare
            VCAP_SERVICES e contenuto tra parentesi graffe, racchiudere VCAP_SERVICES tra doppi apici 
   

   per avviare l'app: npm start
   sul browser aprire http://localhost:5000 per avviare sessione di autenticazione che eseguirà redirect sulla web app