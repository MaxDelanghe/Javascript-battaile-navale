/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var sheep = {dom: {parentNode: {removeChild: function (target) {
    //  console.log(target);
      target.style.display = "none";

    }}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        setGame : function (ref) {
            this.game = ref;
        },
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            // appel la fonction fire du game,
            // et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux
        // ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;
            var snd = '';
            if ((this.grid[line][col] != 0) || (this.grid[line][col] != '0')) {
                snd = document.getElementById("myAudio2");
                this.grid[line][col] = 0;
                succeed = true;
            }
            else {
              snd = document.getElementById("myAudio1"); 
            }
            callback.call(undefined, succeed);
            snd.play();
        },
        setActiveShipPosition: function (x, y) {

            var ship = this.fleet[this.activeShip];
            var i = 0;
            var verif = ship.dom.style.width;
            if (parseInt(verif, 10) <= 60) {
              while (i < ship.getLife()) {
                if (this.grid[y + i]) {
                  if (this.grid[y + i][x] != 0) {
                    alert('Emplacement invalide pour votre bateau')
                    i--;
                    while (i >= 0) {
                      this.grid[y +i][x] = 0;
                      i--;
                    }
                    return false;
                  }
                  else {
                    this.grid[y +i][x] = ship.getId();
                    i += 1;
                  }
                }
                else {
                  alert('Emplacement invalide pour votre bateau')
                  i--;
                  while (i >= 0) {
                    this.grid[y +i][x] = 0;
                    i--;
                  }
                  return false;
                }
              }
            }
            else {
              while (i < ship.getLife()) {
                if (this.grid[y][x + i] != 0) {
                  alert('Emplacement invalide pour votre bateau')
                  i--;
                  while (i >= 0) {
                    this.grid[y][x + i] = 0;
                    i--;
                  }
                  return false;
                }
                else {
                  this.grid[y][x + i] = ship.getId();
                  i += 1;
                }
              }
            }
            console.log(''+this.grid)
            return true;
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (sheep.dom.parentNode) {
                    sheep.dom.parentNode.removeChild(ship.dom);
                }
            });

        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) { // rendu visuel des tirs
            this.tries.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                    if (val === true) {
                        node.style.backgroundColor = '#e60019'; //tir failed
                        node.classList.add("used");
                    } else if (val === false) {
                        node.style.backgroundColor = '#aeaeae'; //tir succeed
                        node.classList.add("used");

                    }
                });
            });
        },

        renderShips: function (grid) { // ??????????????????
        }
    };
    global.player = player;

}(this));
