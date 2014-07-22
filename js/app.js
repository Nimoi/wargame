
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    // Preload our assets
    game.load.image('sky', 'img/sky.png');
    game.load.image('ground', 'img/platform.png');
    game.load.image('llor', 'img/llorenteRender.png');
    game.load.image('fighter', 'img/goomba.png');
    game.load.image('base', 'img/base.gif');
}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;
var combatants;

function create() {
    // Event listeners
    document.getElementById('spawnFighter').addEventListener('click', addCombatant, false);

    // Increasing boundaries past the canvas
    game.world.setBounds(0, 0, 1600, 600);

    // We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // A simple background for our game
    var sky = game.add.sprite(0, 0, 'sky');
    sky.scale.setTo(2, 2);

    platforms = game.add.group();
    // We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    var ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.alpha = 0.75;
    // Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(32, 32);
    // This stops it from falling away when you jump on it
    ground.body.immovable = true;

    // Create Bases
    var playerbase = game.add.sprite(32, game.world.height - 214, 'base');
    var enemybase = game.add.sprite(game.world.width - 232, game.world.height - 214, 'base');

    // Combatants
    combatants = game.add.group();

    // The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
    scoreText.fixedToCamera = true;

    // Controls
    cursors = game.input.keyboard.createCursorKeys();

    // Camera
    game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
    style = 'STYLE_PLATFORMER';
    
}

function update() {

    //  Collide the player with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(combatants, platforms);

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

function addCombatant() {
    // Send combatant
    var comb = combatants.create(32, game.world.height - 214, 'fighter');
    comb.team = 1;
    comb.scale.setTo(0.1, 0.1);
    game.physics.arcade.enable(comb);
    comb.body.bounce.y = 0.2;
    comb.body.gravity.y = 500;
    comb.body.collideWorldBounds = true;
    comb.body.velocity.x = 100;
}