/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        verticaleDecalage: 0,
        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector(".board .main-grid");
            this.miniGrid = document.querySelector(".mini-grid");
            // eroor ? => ('.board .mini-grid')

            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);
            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();

        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }

            switch (this.currentPhase) {

            case this.PHASE_GAME_OVER:

                // detection de la fin de partie
                if (!this.gameIsOver()) {
                    // le jeu n'est pas terminé on recommence un tour de jeu
                    this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                }
                else {
                  utils.info('La partie est terminer');

                }
                break;
            case this.PHASE_INIT_OPPONENT:
                var tab = [0,1];
                var rand = _.sample(tab);
                this.wait();
                utils.info("En attente de votre adversaire");
                this.players[1].areShipsOk(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                });
                do{
                    var selection = parseInt(window.prompt("Qui doit commencer ? taper :1 pour commencer, 2 pour l'ordinateur, 3 pour aleatoire", ""), 10);
                }while(isNaN(selection) || selection > 3 || selection < 1);
                if (selection == 2 || selection == 3 && rand != 0) {
                  this.phaseOrder = [
                      this.PHASE_INIT_PLAYER,
                      this.PHASE_INIT_OPPONENT,
                      this.PHASE_PLAY_OPPONENT,
                      this.PHASE_PLAY_PLAYER,
                      this.PHASE_PLAY_OPPONENT,
                      this.PHASE_GAME_OVER
                  ];
                  this.playerTurnPhaseIndex = 3;
                }
                break;
            case this.PHASE_PLAY_PLAYER:
                utils.info("A vous de jouer, choisissez une case !");
                break;
            case this.PHASE_PLAY_OPPONENT:
                utils.info("A votre adversaire de jouer...");
                this.players[1].play();
                break;
            }

        },
        gameIsOver: function () {
            var count = 0;
            var win = false;
            _.forEach(game.players[0].grid, function(value, key) {
                _.forEach(value, function(value2, key2) {
                  if (value2 == 0) {
                  count++;
                }
              });
            });
            if (count == 100) {
              alert("Vous avez perdu");
              win = true;
            }
            count = 0;
            _.forEach(game.players[1].grid, function(value, key) {
                _.forEach(value, function(value2, key2) {
                  if (value2 == 0) {
                    count++;
                  }
                });
              });
              if (count == 100) {
                alert("Vous avez gagne");
                win = true;
              }
            if (win) {
              return true;
            }
            else {
              return false;
            }
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener("mousemove", _.bind(this.handleMouseMove, this));
            this.grid.addEventListener("click", _.bind(this.handleClick, this));
            //  this.grid.addEventListener('contextmenu', _.bind(this.handleMouseMove2, this));
        },
        handleMouseMove: function (e) {
            var stylebool = true;
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains("cell")) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                if(ship.dom.style.display == "none"){
                  ship.dom.style.display = "block";
                }
                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }
                //click droit detecter
                this.grid.oncontextmenu = function (e) {
                  e.preventDefault();
                  var verif = ship.dom.style.width;
                  if (parseInt(verif, 10) <= (1*utils.CELL_SIZE)) {
                    stylebool = false;
                  }
                  if (stylebool) {
                    ship.dom.style.height = "" + ship.getLife() * utils.CELL_SIZE +  "px";
                    ship.dom.style.width = "" + 1 * utils.CELL_SIZE +  "px";
                    stylebool = false;
                  }
                  else {
                    ship.dom.style.height = "" + 1 * utils.CELL_SIZE +  "px";
                    ship.dom.style.width = "" + ship.getLife() * utils.CELL_SIZE +  "px";
                    stylebool = true;
                  }
              }
          // décalage visuelle, le point d'ancrage du curseur est a gauche du bateau
          // ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
                if (ship.life < 4) {
                  if (this.verticaleDecalage == 0) {
                    this.verticaleDecalage = (1 * utils.CELL_SIZE);
                  }
                  var test = this.players[0].fleet[2].dom.style.width;
                  if(parseInt(test, 10) > (utils.CELL_SIZE) && this.verticaleDecalage > utils.CELL_SIZE){
                      this.verticaleDecalage = (5 * utils.CELL_SIZE);
                  }
                  ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) - this.verticaleDecalage + (utils.CELL_SIZE * 1) + "px";
                  ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + (utils.CELL_SIZE * 1) + "px";
                }
                else {
                //  ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                  ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) - this.verticaleDecalage + "px";
                  ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + (utils.CELL_SIZE * 2) + "px";
                }
            }
        },
        handleClick: function (e) {
          var ship = this.players[0].fleet[this.players[0].activeShip].id;
          var nbr = 0;
          for (var i = 0; i < this.players[0].fleet.length && i < ship; i++) {
            var test = this.players[0].fleet[i].dom.style.height;
            if(parseInt(test, 10) > (utils.CELL_SIZE)){
              nbr++;
            }
          }
          this.verticaleDecalage =  (utils.CELL_SIZE * 4) * nbr;
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains("cell")) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {

                                self.verticaleDecalage = 0;
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                    else {
                      var test = this.players[0].fleet[this.players[0].activeShip].dom.style.height;
                      if(parseInt(test, 10) > (utils.CELL_SIZE)){
                        this.verticaleDecalage -= 240;
                      }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                  if (e.target.classList.contains("used")) {
                    utils.info('Vous avez deja tire ici !');
                  }
                  else {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                    //rendu du tir sur la grande map
                    this.renderMap();
                  }
                }
            }
        },
        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";
            var grid = game.miniGrid;
            var x = col+1;
            var y = line+1;
            var computeurTurn = false;
            console.log('x = ' + col + ' ' + ' : y = ' + line)
            var cible = grid.querySelector('div:nth-child('+y+') > div:nth-child('+x+')');

            // determine qui est l'attaquant et qui est attaqué
            //console.log(this.players[0])
            //console.log(this.players[1])

            var target = this.players.indexOf(from) === 0 ? this.players[1] : this.players[0];
            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
                computeurTurn = true;
            }
            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed) {
                if (hasSucceed) {
                  if (computeurTurn) {
                    cible.style.backgroundColor = 'yellow';
                    var a = 0;
                    _.forEach(target.fleet, function(value, key) {
                      var life = 0;
                      var id = target.fleet[a].id;
                      _.forEach(target.grid, function(value, key) {
                        _.forEach(value, function(value2, key2) {
                          if (id == value2) {
                            life++;
                          }
                        });
                      });

                      if (life == 0) {
                        var sheep = document.querySelector('div.left.column div.fleet')
                        var selector = sheep.children[a];
                        selector.classList.add("sunk");
                      }
                      a++;
                    });
                    //console.log('xxx')
                    //console.log('ligne visse -> ' + target.grid[line])
                  }
                  msg += "Touché !";

                } else {
                  if (computeurTurn) {
                    cible.style.backgroundColor = '#aeaeae';
                  }
                  msg += "Manqué...";
                }

                utils.info(msg);
                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed);

                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 200);
            });

        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
          var grid = this.miniGrid;
          _.forEach(player.grid, function(value, key) {
              _.forEach(value, function(value2, key2) {
                var nav = null;
                switch(value2)
                {
                    case 1:
                      var nav = shipFactory.build(shipFactory.TYPE_BATTLESHIP);
                      break;
                    case 2:
                      var nav = shipFactory.build(shipFactory.TYPE_DESTROYER);
                      break;
                    case 3:
                      var nav = shipFactory.build(shipFactory.TYPE_SUBMARINE);
                      break;
                    case 4:
                      var nav = shipFactory.build(shipFactory.TYPE_SMALL_SHIP);
                      break;
                };
                if (nav !== null) {
                  var row = key + 1;
                  var cell = key2 +1;
                  var target = grid.querySelector(".row:nth-child(" + row + ") .cell:nth-child(" + cell + ")");
                  target.style.backgroundColor = nav.color;
                }
              });
          });
          console.log(player.grid)
        } //dont forget add ',' if ajout d'une ligne
    };

    // point d'entrée
    document.addEventListener("DOMContentLoaded", function () {
        game.init();
    });

}());
