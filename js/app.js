/*
 * War-like-type-kinda game with
 * PHASER JS
 */
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'stage', { preload: preload, create: create, update: update });

function preload() {
    // Preload our assets
    game.load.image('sky', 'img/sky.png');
    game.load.image('ground', 'img/platform.png');
    game.load.image('llor', 'img/llorenteRender.png');
    game.load.image('fighter', 'img/goomba.png');
    game.load.image('base', 'img/base.gif');
}

var player,
platforms,
cursors,
stars,
score = 0,
scoreText,
pHeroes,
eHeroes,
heroes,
bases;

function create() {
    // Event listeners
    document.getElementById('spawnHero').addEventListener('click', addPlayerHero, false);
    document.getElementById('spawnEnemy').addEventListener('click', addEnemyHero, false);

    // Map boundaries
    game.world.setBounds(0, 0, 1600, 600);

    // Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Simple Background
    var sky = game.add.sprite(0, 0, 'sky');
    sky.scale.setTo(2, 2);

    platforms = game.add.group();
    platforms.enableBody = true; // Enables physics body
    // Set the ground
    var ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.alpha = 0.75;
    ground.scale.setTo(32, 32);
    // This stops it from falling away when you jump on it
    ground.body.immovable = true;

    // Create Bases
    bases = game.add.group();
    bases.enableBody = true;
    var playerbase = bases.create(32, game.world.height - 214, 'base');
    playerbase.body.immovable = true;
    var enemybase = bases.create(game.world.width - 232, game.world.height - 214, 'base');
    enemybase.body.immovable = true;

    // Combatants
    // heroes = game.add.group();
    pHeroes = game.add.group();
    eHeroes = game.add.group();
    // heroes.add(pHeroes);
    // heroes.add(eHeroes);

    // The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
    scoreText.fixedToCamera = true;

    // Controls
    cursors = game.input.keyboard.createCursorKeys();

    // Camera
    // game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
    style = 'STYLE_PLATFORMER';

    // TEST
    // Spawn a couple fighters
    addPlayerHero();
    addEnemyHero();
}

function update() {
    // Collisions
    game.physics.arcade.collide(pHeroes, platforms);
    game.physics.arcade.collide(eHeroes, platforms);
    game.physics.arcade.collide(pHeroes, bases);
    game.physics.arcade.collide(eHeroes, bases);
    game.physics.arcade.collide(pHeroes, eHeroes);

    pHeroes.forEach(function(item) {
        if(item.body.velocity.x < 100) {
            item.body.velocity.x += 10;
        }
    });

    eHeroes.forEach(function(item) {
        if(item.body.velocity.x > -100) {
            item.body.velocity.x -= 10;
        }
    });

    if (cursors.up.isDown) {
        game.camera.y -= 4;
    } else if (cursors.down.isDown) {
        game.camera.y += 4;
    }

    if (cursors.left.isDown) {
        game.camera.x -= 4;
    } else if (cursors.right.isDown) {
        game.camera.x += 4;
    }

}

function addPlayerHero() {
    var comb = pHeroes.create(32, game.world.height - 214, 'fighter');
    comb.team = 1;
    comb.scale.setTo(0.1, 0.1);
    game.physics.arcade.enable(comb);
    comb.anchor.setTo(.5,.5);
    comb.scale.x *= -1;
    comb.body.bounce.y = 0.2;
    comb.body.bounce.x = 1.5;
    comb.body.gravity.y = 500;
    comb.body.collideWorldBounds = true;
    comb.body.velocity.x = 100;
}

function addEnemyHero() {
    var comb = eHeroes.create(game.world.width - 232, game.world.height - 214, 'fighter');
    comb.team = 0;
    comb.scale.setTo(0.1, 0.1);
    game.physics.arcade.enable(comb);
    comb.body.bounce.y = 0.2;
    comb.body.bounce.x = 1.5;
    comb.body.gravity.y = 500;
    comb.body.collideWorldBounds = true;
    comb.body.velocity.x = -100;
}