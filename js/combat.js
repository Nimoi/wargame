function extendObj(thing, other) {
    for (var x in other) {
        if (other.hasOwnProperty(x)) {
            thing[x] = other[x];
        }
    };
    return thing;
};
// extendObj(app, { balls: true });

var app = {
    state: 'play',
    addPlayerHero: function(classType) {
        var comb = app.pHeroes.create(32, game.world.height - 214, classType);
        // Scale and enable physics
        // comb.scale.setTo(0.1,0.1);
        game.physics.arcade.enable(comb);
        // Class stats
        comb.classType = classType;
        comb.heroStats = app.getHeroStats(classType);
        comb.team = 1;
        comb.mobile = 1;
        comb.target = 0;
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
        comb.mobile = 1;
        comb.target = 0;
        // Body physics
        comb.body.bounce.y = 0.2;
        comb.body.bounce.x = 1.5;
        comb.body.gravity.y = 500;
        comb.body.collideWorldBounds = true;
        comb.body.velocity.x = -100;
        // comb.tint = 0x962D3E;
    },
    damageMelee: function(pHero, eHero) {
        pHero.heroStats.health -= eHero.heroStats.damage;
        eHero.heroStats.health -= pHero.heroStats.damage;

        var pDamText = game.add.text(pHero.body.position.x, pHero.body.position.y, '-'+ eHero.heroStats.damage, { fontSize: '12px', fill: '#E74C3C' });
        var eDamText = game.add.text(eHero.body.position.x, eHero.body.position.y, '-'+ pHero.heroStats.damage, { fontSize: '12px', fill: '#E74C3C' });
        app.hitText.add(pDamText);
        app.hitText.add(eDamText);

        app.killCheck(pHero);
        app.killCheck(eHero);

        if(pHero.classType == 'thief') {
            pHero.heroStats.stealth = 0;
        }
        if(eHero.classType == 'thief') {
            eHero.heroStats.stealth = 0;
        }
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
                    'speed': 2
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
        switch(hero.classType) {
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
}