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
    hitText: undefined,
    /*
     * Init
     */
    preload: function() {
        // Preload our assets
        game.load.image('sky', 'img/sky.png');
        game.load.image('ground', 'img/platform.png');
        game.load.image('miner', 'img/125c.jpg');
        game.load.image('fighter', 'img/125b.jpeg');
        game.load.image('archer', 'img/125.jpeg');
        game.load.image('thief', 'img/125a.jpeg');
        game.load.image('enemyFighter', 'img/goomba.png');
        game.load.image('base', 'img/base.gif');
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

        // Map boundaries
        game.world.setBounds(0, 0, 1600, 600);

        // Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Simple Background
        var sky = game.add.sprite(0, 0, 'sky');
        sky.scale.setTo(2, 2);

        this.platforms = game.add.group();
        this.platforms.enableBody = true; // Enables physics body
        // Set the ground
        var ground = this.platforms.create(0, game.world.height - 64, 'ground');
        ground.alpha = 0.75;
        ground.scale.setTo(32, 32);
        ground.body.immovable = true;

        // Create Bases
        this.bases = game.add.group();
        this.bases.enableBody = true;

        var playerbase = this.bases.create(32, game.world.height - 214, 'base');
        playerbase.tint = 0x348899;
        playerbase.body.immovable = true;

        var enemybase = this.bases.create(game.world.width - 232, game.world.height - 214, 'base');
        enemybase.tint = 0x962D3E;
        enemybase.body.immovable = true;

        // Combatants
        this.pHeroes = game.add.group();
        this.eHeroes = game.add.group();

        // Floating Damage Text
        this.hitText = game.add.group();

        // Controls
        this.cursors = game.input.keyboard.createCursorKeys();

        // Camera
        // game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
        style = 'STYLE_PLATFORMER';

        // TEST
        // Spawn enemy fighters
        autoSpawn();
    },
    /*
     * Game loop
     */
    update: function() {
        // Collisions
        game.physics.arcade.collide(app.pHeroes, app.platforms);
        game.physics.arcade.collide(app.eHeroes, app.platforms);
        game.physics.arcade.collide(app.pHeroes, app.bases);
        game.physics.arcade.collide(app.eHeroes, app.bases);
        game.physics.arcade.collide(app.pHeroes, app.eHeroes, this.damage);

        app.pHeroes.forEach(function(item) {
            if(item.body.velocity.x < 100) {
                item.body.velocity.x += 10;
            }
        });

        app.eHeroes.forEach(function(item) {
            if(item.body.velocity.x > -100) {
                item.body.velocity.x -= 10;
            }
        });

        app.hitText.forEach(function(item) {
            if(!item) {
                return;
            }
            item.alpha -= 0.05;
            item.position.y -= 6;
            if(item.alpha <= 0) {
                item.destroy();
            }
        });

        if (app.cursors.up.isDown) {
            game.camera.y -= 4;
        } else if (app.cursors.down.isDown) {
            game.camera.y += 4;
        }

        if (app.cursors.left.isDown) {
            game.camera.x -= 4;
        } else if (app.cursors.right.isDown) {
            game.camera.x += 4;
        }
    },
    addPlayerHero: function(classType) {
        var comb = app.pHeroes.create(32, game.world.height - 214, classType);
        // Scale and enable physics
        // comb.scale.setTo(0.1,0.1);
        game.physics.arcade.enable(comb);
        // Class stats
        comb.classType = classType;
        comb.heroStats = app.getHeroStats(classType);
        comb.team = 1;
        // Flip sprite
        comb.anchor.setTo(.5,.5);
        // comb.scale.x *= -1;
        // Body physics
        comb.body.bounce.y = 0.2;
        comb.body.bounce.x = 1.5;
        comb.body.gravity.y = 500;
        comb.body.collideWorldBounds = true;
        comb.body.velocity.x = 100;
        // comb.tint = 0x348899;
    },
    addEnemyHero: function(classType) {
        var comb = app.eHeroes.create(game.world.width - 232, game.world.height - 214, classType);
        // Scale and enable physics
        // comb.scale.setTo(0.1, 0.1);
        game.physics.arcade.enable(comb);
        // Class stats
        comb.classType = classType;
        comb.heroStats = app.getHeroStats(classType);
        comb.team = 0;
        // Body physics
        comb.body.bounce.y = 0.2;
        comb.body.bounce.x = 1.5;
        comb.body.gravity.y = 500;
        comb.body.collideWorldBounds = true;
        comb.body.velocity.x = -100;
        // comb.tint = 0x962D3E;
    },
    damage: function(pHero, eHero) {
        pHero.heroStats.health -= eHero.heroStats.damage;
        eHero.heroStats.health -= pHero.heroStats.damage;

        var pDamText = game.add.text(pHero.body.position.x, pHero.body.position.y, '-'+ eHero.heroStats.damage, { fontSize: '12px', fill: '#E74C3C' });
        var eDamText = game.add.text(eHero.body.position.x, eHero.body.position.y, '-'+ pHero.heroStats.damage, { fontSize: '12px', fill: '#E74C3C' });
        app.hitText.add(pDamText);
        app.hitText.add(eDamText);

        app.killCheck(pHero);
        app.killCheck(eHero);
    },
    killCheck: function(item) {
        if(!item.dieAt) {
            if(item.heroStats.health <= 0) {
                item.body.velocity.x *= 3;
                item.body.velocity.y = -100;
                item.body.collideWorldBounds = false;
                item.body.angularVelocity = game.rnd.integerInRange(100, 200);
                item.body.angularDrag = game.rnd.integerInRange(0, 100);
                item.body.checkCollision.up = false;
                item.body.checkCollision.down = false;
                item.body.checkCollision.left = false;
                item.body.checkCollision.right = false;
            }
        }
    },
    getHeroStats: function(classType) {
        switch(classType) {
            case 'miner':
                return {
                    'health': 10,
                    'mitigation': 1,
                    'damage': 2,
                    'range': 1,
                    'cost': 10,
                    'speed': 2
                }
            break;
            case 'fighter':
                return {
                    'health': 30,
                    'mitigation': 4,
                    'damage': 2,
                    'range': 1,
                    'cost': 20,
                    'speed': 2
                }
            break;
            case 'archer':
                return {
                    'health': 20,
                    'mitigation': 2,
                    'damage': 4,
                    'range': 10,
                    'cost': 30,
                    'speed': 1
                }
            break;
            case 'thief':
                return {
                    'health': 5,
                    'mitigation': 0,
                    'damage': 6,
                    'range': 0,
                    'cost': 40,
                    'speed': 3
                }
            break;
        }
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
    var classArray = ['miner', 'fighter', 'archer', 'thief'],
        rand = classArray[Math.floor(Math.random() * classArray.length)];
    app.addEnemyHero(rand);
    window.setTimeout(autoSpawn, 2000);
}
