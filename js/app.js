/*
 * War-like-type-kinda game with
 * PHASER JS
 */
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'stage', { preload: preload, create: create, update: update });

var app = {
    platforms: undefined,
    cursors: undefined,
    pHeroes: undefined, // Player heroes
    eHeroes: undefined, // Enemy heroes
    bases: undefined,
    mines: undefined,
    miners: undefined,
    hitText: undefined,
    projectiles: undefined,
    pProj: undefined,
    eProj: undefined,
    resourceText: undefined,
    /*
     * Init
     */
    preload: function() {
        // Preload our assets
        game.load.image('sky', 'img/magicsky.gif');
        game.load.image('ground', 'img/platform.png');
        game.load.image('enemyFighter', 'img/goomba.png');
        game.load.image('base', 'img/base.png');
        game.load.image('mine', 'img/mine.png');
        game.load.image('bullet', 'img/bullet.png');
        game.load.spritesheet('miner', 'img/minersprite.png', 32, 32, 2);
        game.load.spritesheet('fighter', 'img/fightersprite.png', 32, 32, 2);
        game.load.spritesheet('archer', 'img/archersprite.png', 32, 32, 2);
        game.load.spritesheet('thief', 'img/thiefsprite.png', 32, 32, 2);
    },
    create: function() {
        // Event listeners
        document.getElementById('spawnMiner').addEventListener('click', function() {
            app.addPlayerHero('miner');
        }, false);
        document.getElementById('spawnFighter').addEventListener('click', function() {
            app.addPlayerHero('fighter');
        }, false);
        document.getElementById('spawnArcher').addEventListener('click', function() {
            app.addPlayerHero('archer');
        }, false);
        document.getElementById('spawnThief').addEventListener('click', function() {
            app.addPlayerHero('thief');
        }, false);
        document.getElementById('callout').addEventListener('click', app.onCallout, false);

        // Map boundaries
        game.world.setBounds(0, 0, 2000, 600);

        // Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Simple Background
        var sky = game.add.sprite(0, 0, 'sky');
        sky.scale.setTo(2, 2);

        this.platforms = game.add.group();
        this.platforms.enableBody = true; // Enables physics body
        // Set the ground
        var ground = this.platforms.create(0, game.world.height - 64, 'ground');
        ground.alpha = 1;
        ground.scale.setTo(32, 32);
        ground.body.immovable = true;

        // Create Bases
        this.bases = game.add.group();
        this.bases.enableBody = true;

        // Mines
        this.mines = game.add.group();
        this.mines.enableBody = true;

        // Combatants
        this.pHeroes = game.add.group();
        this.eHeroes = game.add.group();

        // Miners
        this.miners = game.add.group();

        // this.pHeroes.checkWorldBounds = true;
        // this.pHeroes.setAll('outOfBoundsKill', true);
        // this.eHeroes.checkWorldBounds = true;
        // this.eHeroes.setAll('outOfBoundsKill', true);

        // Floating Damage Text
        this.hitText = game.add.group();

        // Projectiles
        this.projectiles = game.add.group();
        this.projectiles.enableBody = true;

        this.pProj = game.add.group();
        this.pProj.enableBody = true;

        this.eProj = game.add.group();
        this.eProj.enableBody = true;

        this.projectiles.add(this.pProj);
        this.projectiles.add(this.eProj);

        // Controls
        this.cursors = game.input.keyboard.createCursorKeys();

        // Camera
        style = 'STYLE_PLATFORMER';
    },
    /*
     * Game loop
     */
    update: function() {
        // Collisions
        game.physics.arcade.collide(app.pHeroes, app.platforms);
        game.physics.arcade.collide(app.eHeroes, app.platforms);
        game.physics.arcade.collide(app.pHeroes, app.bases, this.damageBase);
        game.physics.arcade.collide(app.eHeroes, app.bases, this.damageBase);
        game.physics.arcade.collide(app.pHeroes, app.eHeroes, this.damageMelee);
        game.physics.arcade.collide(app.pProj, app.eHeroes, this.damageRange);
        game.physics.arcade.collide(app.eProj, app.pHeroes, this.damageRange);
        game.physics.arcade.collide(app.pProj, app.bases, this.damageBase);
        game.physics.arcade.collide(app.eProj, app.bases, this.damageBase);

        /*
         * Heroes
         * These should be combined.
         */
        app.pHeroes.forEach(function(hero) {
            app.updateHero(hero);
        });
        app.eHeroes.forEach(function(hero) {
            app.updateHero(hero);
        });
        /*
         * Projectiles
         * Enemy and player. These should be combined.
         */
        app.pProj.forEach(function(proj) {
            if(!proj) {
                return;
            }
            if(proj.heroStats.health) {
                this.game.physics.arcade.moveToObject(proj, proj.target, 500);
            }
            if(!proj.target.alive) {
                proj.destroy();
            }
        });
        app.eProj.forEach(function(proj) {
            if(!proj) {
                return;
            }
            if(proj.heroStats.health) {
                this.game.physics.arcade.moveToObject(proj, proj.target, 500);
            }
            if(!proj.target.alive) {
                proj.destroy();
            }
        });
        /*
         * Floating text
         */
        app.hitText.forEach(function(item) {
            if(!item) {
                return;
            }
            item.alpha -= 0.02;
            item.position.y -= 2;
            if(item.alpha <= 0) {
                item.destroy();
            }
        });
        /*
         * Camera Movement
         */
        if (app.cursors.up.isDown) {
            game.camera.y -= 12;
        } else if (app.cursors.down.isDown) {
            game.camera.y += 12;
        }

        if (app.cursors.left.isDown) {
            game.camera.x -= 12;
        } else if (app.cursors.right.isDown) {
            game.camera.x += 12;
        }
        /*
         * UI
         */
        if(app.resources.player.gold >= app.stats.prices.miner) {
          document.getElementById('spawnMiner').className = "spawn affordable";
        } else {
          document.getElementById('spawnMiner').className = "spawn";
        }
        if(app.resources.player.gold >= app.stats.prices.fighter) {
          document.getElementById('spawnFighter').className = "spawn affordable";
        } else {
          document.getElementById('spawnFighter').className = "spawn";
        }
        if(app.resources.player.gold >= app.stats.prices.archer) {
          document.getElementById('spawnArcher').className = "spawn affordable";
        } else {
          document.getElementById('spawnArcher').className = "spawn";
        }
        if(app.resources.player.gold >= app.stats.prices.thief) {
          document.getElementById('spawnThief').className = "spawn affordable";
        } else {
          document.getElementById('spawnThief').className = "spawn";
        }
    },
    state: 'start',
    onCallout: function() {
      if(app.state == 'start') {
        app.startGame();
        document.getElementById('callout').innerHTML = '';
        document.getElementById('menu').className = 'active';
      }
    },
    startGame: function() {
      // Bases
      this.playerBase = this.bases.create(92, game.world.height - 178, 'base');
      this.playerBase.tint = 0x348899;
      this.playerBase.body.immovable = true;
      this.playerBase.baseHealth = 1000;

      this.enemyBase = this.bases.create(game.world.width - 172, game.world.height - 178, 'base');
      this.enemyBase.tint = 0x962D3E;
      this.enemyBase.body.immovable = true;
      this.enemyBase.baseHealth = 1000;

      // Mines
      this.playerMine = this.mines.create(364, game.world.height - 149, 'mine');
      // this.playerMine.tint = 0x348899;
      this.playerMine.body.immovable = true;
      this.playerMine.baseHealth = 500;

      this.enemyMine = this.mines.create(game.world.width - 464, game.world.height - 149, 'mine');
      // this.enemyMine.tint = 0x962D3E;
      this.enemyMine.body.immovable = true;
      this.enemyMine.baseHealth = 500;

      // Resources
      this.resourceText = game.add.text(16, 16, 'Gold: '+app.resources.player.gold, { fontSize: '16px', fill: '#fff' });
      this.resourceText.fixedToCamera = true;

      // Update buttons
      document.getElementById('spawnMiner').querySelector('.price').innerHTML += app.stats.prices.miner;
      document.getElementById('spawnFighter').querySelector('.price').innerHTML += app.stats.prices.fighter;
      document.getElementById('spawnArcher').querySelector('.price').innerHTML += app.stats.prices.archer;
      document.getElementById('spawnThief').querySelector('.price').innerHTML += app.stats.prices.thief;

      // Spawn enemy fighters
      app.addEnemyHero('miner');
      autoSpawn();
    },
    resources: {
        player: {
            gold: 40 
        },
        enemy: {
            gold: 40 
        }
    },
    stats: {
        prices: {
            miner: 10,
            fighter: 10,
            archer: 40,
            thief: 15
        },
        restrictions: {
            miner: 5,
            fighter: 0,
            archer: 0,
            thief: 0
        }
    },
    /*
     * Check the price, deduct the amount if available
     */
    priceCheck: function(classType, team) {
        switch(classType) {
            case 'miner':
                if(app.resources[team].gold >= app.stats.prices.miner) {
                    app.resources[team].gold -= app.stats.prices.miner;
                    return true;
                }
            break;
            case 'fighter':
                if(app.resources[team].gold >= app.stats.prices.fighter) {
                    app.resources[team].gold -= app.stats.prices.fighter;
                    return true;
                }
            break;
            case 'archer':
                if(app.resources[team].gold >= app.stats.prices.archer) {
                    app.resources[team].gold -= app.stats.prices.archer;
                    return true;
                }
            break;
            case 'thief':
                if(app.resources[team].gold >= app.stats.prices.thief) {
                    app.resources[team].gold -= app.stats.prices.thief;
                    return true;
                }
            break;
            default:
                return false;
            break;
        }
    },
    /*
     * Spawn player heroes.
     * These two functions should really be combined.
     */
    addPlayerHero: function(classType) {
        if(!app.priceCheck(classType, 'player')) {
            return false;
        } else {
            app.resourceText.text = 'Gold: '+app.resources.player.gold;
        }
        var comb = app.pHeroes.create(92, game.world.height - 178, classType);
        // Scale and enable physics
        comb.scale.setTo(2,2);
        game.physics.arcade.enable(comb);
        // Class stats
        comb.classType = classType;
        comb.heroStats = app.getHeroStats(classType);
        comb.team = 1;
        comb.mobile = 1;
        comb.target = 0;
        // Flip sprite
        if(classType == 'miner') {
          comb.body.setSize(14, 15, 32, 32);
        }
        // comb.anchor.setTo(.5,.5);
        // Body physics
        comb.body.bounce.y = 0.2;
        comb.body.bounce.x = 1.5;
        comb.body.gravity.y = 500;
        comb.body.collideWorldBounds = true;
        comb.body.velocity.x = 100;
        // comb.tint = 0x348899;
        comb.animations.add('walk', [0, 1], 1, true);
    },
    addEnemyHero: function(classType) {
        if(!app.priceCheck(classType, 'enemy')) {
            return false;
        }
        var comb = app.eHeroes.create(game.world.width - 172, game.world.height - 178, classType);
        // Scale and enable physics
        comb.scale.setTo(2,2);
        game.physics.arcade.enable(comb);
        // Class stats
        comb.classType = classType;
        comb.heroStats = app.getHeroStats(classType);
        comb.team = 0;
        comb.mobile = 1;
        comb.target = 0;
        // Flip sprite
        if(classType == 'miner') {
          comb.body.setSize(14, 15, 17, 17);
        }
        comb.anchor.setTo(.5,.5);
        comb.scale.x *= -1;
        // Body physics
        comb.body.bounce.y = 0.2;
        comb.body.bounce.x = 1.5;
        comb.body.gravity.y = 500;
        comb.body.collideWorldBounds = true;
        comb.body.velocity.x = -100;
        // comb.tint = 0x962D3E;
        comb.animations.add('walk', [0, 1], 1, true);
    },
    damageMelee: function(pHero, eHero) {
        var eDmgMult = 1,
        pDmgMult = 1,
        eDmgReduction = 0,
        pDmgReduction = 0,
        eDamage,
        pDamage;
        // Thief special attacks
        if(pHero.classType == 'thief') {
          if(pHero.heroStats.stealth == 1) {
            pHero.heroStats.stealth = 0;
            pDmgMult = 2;
            pDmgReduction = 0.5;
          }
        }
        if(eHero.classType == 'thief') {
          if(eHero.heroStats.stealth == 1) {
            eHero.heroStats.stealth = 0;
            eDmgMult = 2;
            eDmgReduction = 0.5;
          }
        }
        // Archer reduced melee
        if(pHero.classType == 'archer') {
          pDmgMult = 0.2;
        }
        if(eHero.classType == 'archer') {
          eDmgMult = 0.2;
        }
        pDamage = pHero.heroStats.damage * (pDmgMult - eDmgReduction).toFixed(0);
        eDamage = eHero.heroStats.damage * (eDmgMult - pDmgReduction).toFixed(0);
        pHero.heroStats.health -= eDamage;
        eHero.heroStats.health -= pDamage;

        var pDamText = game.add.text(pHero.body.position.x, pHero.body.position.y, '-'+ eDamage, { fontSize: '12px', fill: '#E74C3C' });
        var eDamText = game.add.text(eHero.body.position.x, eHero.body.position.y, '-'+ pDamage, { fontSize: '12px', fill: '#E74C3C' });
        app.hitText.add(pDamText);
        app.hitText.add(eDamText);

        app.killCheck(pHero);
        app.killCheck(eHero);
    },
    damageRange: function(proj, hero) {
        // Remove hero velocity (stun)
        hero.body.velocity.x = 0;
        // Dmg the hero
        hero.heroStats.health -= proj.dmg;
        var damText = game.add.text(hero.body.position.x, hero.body.position.y, '-'+ proj.dmg, { fontSize: '12px', fill: '#E74C3C' });
        app.hitText.add(damText);
        // Remove the projectile
        // proj.destroy();
        if(hero.team) {
            // app.eProj.remove(proj);
        } else {
            // app.pProj.remove(proj);
        }
        app.killCheck(hero);
        proj.heroStats.health = 0;
        app.killCheck(proj);
    },
    damageBase: function(unit, base) {
        var loser = 0,
        damage = unit.heroStats.damage;
        // Who's base attacked?
        if(base == app.playerBase) {
            loser = 1;
        }
        // Hero or projectile?
        if(unit.dmg) {
            damage = unit.dmg;
        }
        // Remove health
        base.baseHealth -= damage;
        // Add damage tick
        var damText = game.add.text(base.body.position.x, base.body.position.y, '-'+damage, { fontSize: '12px', fill: '#E74C3C' });
        app.hitText.add(damText);
        if(unit.dmg) {
            unit.heroStats.health = 0;
            app.killCheck(unit);
        }
        // End the game?
        if (base.baseHealth <= 0) {
            base.destroy();
            app.gameOver(loser);
        }
    },
    killCheck: function(item) {
        if(!item.dieAt) {
            if(item.heroStats.health <= 0) {
                item.body.velocity.x = 0;
                item.body.velocity.y = 400;
                item.body.collideWorldBounds = false;
                item.body.angularVelocity = game.rnd.integerInRange(100, 200);
                item.body.angularDrag = game.rnd.integerInRange(0, 100);
                item.body.checkCollision.up = false;
                item.body.checkCollision.down = false;
                item.body.checkCollision.left = false;
                item.body.checkCollision.right = false;
                item.alive = false;
                if(!item.team) {
                  app.resources.player.gold += 2;
                } else {
                  app.resources.enemy.gold += 2;
                }
                app.resourceText.text = 'Gold: '+app.resources.player.gold;
            }
        }
    },
    removeEntity: function(unit) {
        if(unit.position.y > 800) {
            console.log('REMOVING UNIT!');
            unit.destroy();
        }
    },
    getHeroStats: function(classType) {
        switch(classType) {
            case 'miner':
                return {
                    'health': 5,
                    'damage': 0,
                    'range': 1,
                    'cost': 10,
                    'speed': 1,
                    'collectRate': 1000,
                    'canCollect': 0,
                    'collected': 0
                }
            break;
            case 'fighter':
                return {
                    'health': 60,
                    'damage': 5,
                    'range': 1,
                    'cost': 20,
                    'speed': 2
                }
            break;
            case 'archer':
                return {
                    'health': 30,
                    'damage': 20,
                    'range': 400,
                    'cost': 30,
                    'speed': 1,
                    'fireRate': 1000,
                    'canFire': 0
                }
            break;
            case 'thief':
                return {
                    'health': 15,
                    'damage': 15,
                    'range': 0,
                    'cost': 40,
                    'speed': 3,
                    'stealth': 1
                }
            break;
        }
    },
    updateHero: function(hero) {
        if(hero == undefined || hero.heroStats.health <= 0) {
            return;
        }
        hero.animations.play('walk', 8, true);
        switch(hero.classType) {
            case 'fighter': 
            break;
            case 'archer':
                // Look for a target
                if(!hero.target) {
                    this.getTargetFromRange(hero);
                    break;
                }
                // moves forward and looks for a new target
                if(!hero.target.alive) {
                    hero.mobile = 1;
                    hero.target = 0;
                }
                // shoots at target
                if(game.time.time >= hero.heroStats.canFire) {
                    this.fireAtTarget(hero);
                }
            break;
            case 'thief':
                if(hero.heroStats.stealth) {
                    hero.alpha = 0.6;
                } else {
                    hero.alpha = 1;
                }
            break;
            case 'miner':
                // Travel to node
                var targetMine = app.enemyMine,
                targetBase = app.enemyBase,
                distance,
                distanceToBase = 100,
                overlapping = false;
                if(hero.team) {
                    targetMine = app.playerMine;
                    targetBase = app.playerBase;
                }
                distance = game.physics.arcade.distanceBetween(hero, targetMine);
                overlapping = game.physics.arcade.overlap(hero, targetMine);
                if(overlapping && hero.heroStats.collected < 10) {
                    hero.mobile = 0;
                    hero.collecting = 1;
                    hero.body.velocity.x = 0;
                    // Collect from node
                    if(game.time.time >= hero.heroStats.canCollect) {
                        hero.heroStats.collected += 1;
                        hero.heroStats.canCollect = game.time.time + hero.heroStats.collectRate;
                        if(hero.team) {
                            var text = game.add.text(hero.body.position.x, hero.body.position.y, '+1', { fontSize: '12px', fill: '#8FCC00', stroke: '#141414', strokeThickness: 2 });
                            app.hitText.add(text);
                        }
                    }
                }
                // Return to base
                if(hero.heroStats.collected >= 10) {
                    hero.collecting = 0;
                    distance = game.physics.arcade.distanceBetween(hero, targetBase);
                    // console.log(distance);
                    // console.log(distanceToBase);
                    if(distance > distanceToBase) {
                        // Travel in base direction
                        if(hero.team) {
                            if(hero.body.velocity.x > -100) {
                                hero.body.velocity.x -= 10;
                            }
                        } else {
                            if(hero.body.velocity.x < 100) {
                                hero.body.velocity.x += 10;
                            }
                        }
                    } else {
                        // Deposit resources and return to mine
                        hero.mobile = 1;
                        if(hero.team) {
                            app.resources.player.gold += hero.heroStats.collected;
                            app.resourceText.text = 'Gold: '+app.resources.player.gold;
                            hero.heroStats.collected = 0;
                        } else {
                            app.resources.enemy.gold += hero.heroStats.collected;
                            hero.heroStats.collected = 0;
                        }
                    }
                }
            break;
            default:
            break;
        }

        if(hero.mobile) {
            // Move that hero!
            if(hero.team) {
                if(hero.body.velocity.x < 100) {
                    hero.body.velocity.x += 10;
                }
            } else {
                if(hero.body.velocity.x > -100) {
                    hero.body.velocity.x -= 10;
                }
            }
        }
        if(!hero.alive) {
            this.removeEntity(hero);
        }
    },
    getTargetFromRange: function(hero) {
        var targetTeam = 0,
        targetGroup,
        targetBase,
        baseDistance,
        distance = hero.heroStats.range,
        newTarget = 0;
        if(!hero.team) {
            targetTeam = 1;
            targetGroup = app.pHeroes;
            targetBase = app.playerBase;
        } else {
            targetGroup = app.eHeroes;
            targetBase = app.enemyBase;
        }
        // Base in range
        baseDistance = game.physics.arcade.distanceBetween(hero, targetBase);
        if(baseDistance <= distance) {
            newTarget = targetBase;
        } else {
            // Hero in range
            targetGroup.forEach(function(target) {
                if(target.heroStats.stealth) {
                    return;
                }
                var newDistance = game.physics.arcade.distanceBetween(hero, target);
                if(newDistance < distance) {
                    distance = newDistance;
                    newTarget = target;
                }
            });
        }
        if(newTarget) {
            hero.mobile = 0;
            hero.body.velocity.x = 0;
            hero.target = newTarget;
        }
    },
    fireAtTarget: function(hero) {
        var projGroup = app.pProj;
        if(!hero.team) {
            projGroup = app.eProj;
        }
        var proj = projGroup.create(hero.position.x, hero.position.y, 'bullet');
        proj.target = hero.target;
        proj.team = hero.team;
        proj.dmg = hero.heroStats.damage;
        proj.body.bounce.x = 0;
        proj.heroStats = {
            health: 1
        };
        proj.scale.setTo(0.1, 0.1);
        if(hero.team) {
            proj.anchor.setTo(.5,.5);
            proj.scale.x *= -1;
        }
        game.physics.arcade.enable(proj);
        // Delay next firing
        hero.heroStats.canFire = game.time.time + hero.heroStats.fireRate;
    },
    gameOver: function() {
        // End the game
        // Clear out groups
        // var groups = [app.pHeroes, app.eHeroes, app.pProj, app.eProj, app.bases];
        // groups.forEach(function(group) {
        //     group.forEach(function(item) {
        //         group.remove(item);
        //     });
        // });
        app.state = 'over';
    }
}

function preload() {
    app.preload();
}

function create() {
    app.create();
}

function update() {
    app.update();
}

function autoSpawn() {
    if(app.state == 'over') {
        return;
    }
    var classArray = [
        {
            'class': 'miner',
            'time': 3000
        },
        {
            'class': 'fighter',
            'time': 3500
        },
        {
            'class': 'archer',
            'time': 5000
        },
        {
            'class': 'thief',
            'time': 7000
        }
    ],
    rand = classArray[Math.floor(Math.random() * classArray.length)];
    if(!game.paused) {
        app.addEnemyHero(rand.class);
    }
    window.setTimeout(autoSpawn, 1000);
}

// Woo!
function extendObj(thing, other) {
    for (var x in other) {
        if (other.hasOwnProperty(x)) {
            thing[x] = other[x];
        }
    };
    return thing;
};

extendObj(app, { balls: true });
console.log(app.balls);