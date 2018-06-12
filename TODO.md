
Entrées/Sorties : std(in/out), twitch, discord, youtube live...
généralisation entrée/sortie => ConnectorIO

CommandHandler
abstract Command (supports(CommandExchange) handle(CommandExchange):CommandResponse)
exemple : TwitterListBotCommand extends Command

ConnectorIO::write(CommandResponse);

-----------------------------------------
## Trucs à penser

Cache avec Redis ? (ex : liste des 1000 derniers utilisateurs)

-----------------------------------------
## Backlog

* Pouvoir restreindre les droits d'une commande : gestion de rôles uniformisés selon le ConnectorIO
* Pouvoir write sur un autre Connector que l'input
* Pouvoir éxecuter des commandes sans input (CRON ?)
* Pouvoir enregistrer des états de commande selon l'invoqueur (exemple : ioni tape la commande "ashucoins", retourne SA propre donnée)
* Sécurité antispam et antilien
* Gestion statut modérateur connector Twitch
* README.md

-----------------------------------------
## Planification Connectors.

* Twitch
* Youtube live
* Discord
* Facebook
* Twitter
* Streamlabs
* GameWhisp
* StreamerElements
* Internal API

-----------------------------------------
## Twitch commands list

* ~~commande qui liste les commandes statiques~~
* ~~commande qui liste toutes les commandes disponibles~~ (selon le rôle)
* commandes pour un compteur de mort (par exemple pour les jeux try-hard)
    * activer/désactiver le compteur ("deathcounter on/off")
    * incr le nb morts ("deathcounterincr")
    * decr le nb morts ("deathcounterdecr")
    * set le nb morts ("deathcounterset X")
    * demander le nb morts ("deathcounter")
* ~~"!last" pour avoir les dernières connexions viewers~~
* ~~"!game" pour avoir le nom du jeu actuel~~
* ~~"!title" pour le titre du stream + nom du jeu si en live~~
* ~~"!playtime" pour le uptime du jeu actuel en live~~
* ~~"!uptime" pour le uptime total du live~~
* ~~"!pause" pour ne plus répondre aux commandes~~
* ~~"!resume" pour enlever "pause"~~
* "!mute" pour ne pas envoyer de réponse
* "!unmute" pour enlever "mute"
* ~~"!users" pour avoir la liste des viewers~~
* ~~"!mods" pour avoir la liste des modos~~ 
* "!whispermode on/off" toutes les réponses sont envoyées en "whisper" à l'invoqueur
* "!kill <target>" retourne "<invoqueur> a tué <target>!" (vérifier que target est bien un viewer/modo)
* "!roll start/end <entier>" lance une roulette entre [[1, entier]]
* "!rollvote <entier> <mise>" voter sur le roll avec la mise
* ~~"!random <entier>" retourne un entier aléatoire entre [[1, entier]]~~
* "!bits on/off" active/désactive l'annonce lorsqu'il y a un don de bits
* "!bitsmessage <message>" set le message qui sera affiché lorsqu'il y a un don en bits. Variables : %username%, %amount%
* "!bitsminimum <entier>" set le nombre minimal de bits pour que le message soit affiché
* "!clips on/off" active/désactive l'annonce lorsqu'il y a un clip de créé
* "!clipsmessage <message>" set le message qui sera affiché lorsqu'il y a un clip de créé. Variables : %username%, %cliptitle%
* "!lastclip" affiche le dernier clip capturé
* "!topclip" affiche le lien vers le clip le plus regardé
* "!streamlabs on/off" permet l'annonce ou pas les donateurs
* "!streamlabsmessage <message>" set l'annonce
* "!streamlabsminamount <float>" condition sur la donation pour afficher l'annonce
* "!streamerelements on/off" permet l'annonce ou pas les donateurs
* "!streamerelementsmessage <message>" set l'annonce
* "!streamerelementsminamount <float>" condition sur la donation pour afficher l'annonce
* "!followers on/off" permet l'annonce ou pas des follows
* "!followersmessage <message>" set l'annonce
* "!followcheck <username>" infos sur le suivi de la chaîne à propos de <username>
* "!gamescan <gamename>" donne les stats sur un jeu joué sur la chaîne (combien de temps passé?....)
* "!gamewhisp on/off" permet l'annonce ou pas des subs
* "!gamewhisp <message>" set l'annonce
* "!subs on/off" permet l'annonce ou pas des subs
* "!subs <message>" set l'annonce
* "!subwelcome on/off" permet l'annonce ou pas d'un greetings pour les subs
* "!subwelcomemessage <message>" set l'annonce
* "!host on/off" permet l'annonce ou pas des hosts (duplication du flux de la chaîne)
* "!hostmessage <message>" set l'annonce
* "!hostminviewers <entier>" condition sur le nombre minimum de viewers de l'autre chaîne pour afficher l'annonce
* "!raid on/off" permet l'annonce ou pas des raids
* "!raidmessage <message>" set l'annonce
* "!raidminviewers <entier>" condition sur le nombre minimum de viewers de l'autre chaîne pour afficher l'annonce
* "!addtimermessage <message>" ajoute un timer qui toutes les X secondes affiche <message>
* "!changetimerinterval <seconds>" change l'intervalle en secondes du timer
* "!listtimermessage" retourne les timers enregistrés avec leur ID dans l'ordre de leur position
* "!deltimermessage <ID>" supprimer le timer <ID>
* "!setpositiontimermessage <ID> <position>" échange le message <ID> avec le message à la position <position>
* "!timer minactivity <nbmessages>" doit avoir au moins <nbmessages> entre deux timer messages d'affichés



