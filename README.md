Wargame thing

* Need to combine groups with parent groups without breaking everything
* Weird bug - crashes sometimes with "Uncaught TypeError: Cannot read property 'exists' of undefined". Might need to debug with unminified phaser.. Must be trying to detect collisions with destroyed heroes? Two archers shooting at once causes this.
* Gotta DRY it up
* Arrows should stall heroes, but not push them back