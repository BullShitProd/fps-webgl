import * as BABYLON from 'babylonjs';

export default class Weapons {
  constructor(player) {
    // On permet d'accéder à Player n'importe où dans Weapons
    this.player = player;
    // Engine va nous être utile pour la cadence de tir
    this.engine = this.player.scene.getEngine();

    // On récupère l'armurerie
    this.armory = this.player.game.armory;

    // Positions selon l'arme non utilisée
    this.bottomPosition = new BABYLON.Vector3(0.5, -2.5, 1);

    // Changement de Y quand l'arme est séléctionnée
    this.topPositionY = -0.5;

    // Ajout de l'inventaire
    this.inventory = [
      this.createNewWeapon('Crook'),
      this.createNewWeapon('Timmy'),
      this.createNewWeapon('Ezekiel'),
      this.createNewWeapon('Armageddon'),
    ];

    // Notre arme actuelle est Ezekiel, qui se trouve en deuxième position
    // dans le tableau des armes dans Armory
    this.actualWeaponIndex = 1;

    // on dit que Timmy est notre arme active
    this.inventory[1].isActive = true;

    // On dit que la cadence est celle de l'arme actuelle (grâce à indexArmory)
    this.fireRate = this.defineFireRate();

    // Delta de calcul pour savoir quand le tir est à nouveau disponible
    this._deltaFireRate = this.fireRate;

    // Variable qui va changer selon le temps
    this.canFire = true;

    // Params qui changera à 'ppel du tir depuis le player
    this.lauchBullets = false;

    this.decrementeDelataFireRate();
  }

  createNewWeapon(nameWeapon) {
    let newWeapon = null;

    const findIndexArmory = this.armory.weapons.findIndex((weapon) => weapon.name === nameWeapon);

    if (findIndexArmory !== -1) {
      const findWeapon = this.armory.weapons[findIndexArmory];

      newWeapon = BABYLON.MeshBuilder.CreateBox('weapon', { size: 0.5, sideOrientation: 2 }, this.player.scene);

      // Nous faisons en sorte d'avoir une arme d'apparence plus longue que large
      newWeapon.scaling = new BABYLON.Vector3(1, 0.7, 2);

      // On l'associe à la caméra pour qu'il bouge de la même facon
      newWeapon.parent = this.player.camera;
      // On positionne le mesh APRES l'avoir attaché à la caméra
      newWeapon.position = this.bottomPosition.clone();
      // newWeapon.position.y = this.topPositionY;

      newWeapon.isPickable = false;

      // Ajoutons un material Rouge pour le rendre plus visible
      const materialWeapon = new BABYLON.StandardMaterial(`${nameWeapon}Material`, this.player.scene);
      materialWeapon.diffuseColor = findWeapon.setup.colorMesh;

      newWeapon.material = materialWeapon;

      newWeapon.indexArmory = findIndexArmory;

      newWeapon.isActive = false;
    } else {
      // eslint-disable-next-line no-console
      console.log('UNKNOWN WEAPON');
    }

    return newWeapon;
  }

  getActualWeapon() {
    return this.inventory.find((weapon) => weapon.isActive);
  }

  defineFireRate() {
    const activeWeapon = this.getActualWeapon();
    return this.armory.getWeaponById(activeWeapon.indexArmory).setup.cadency;
  }

  nextWeapon(way) {
    // On définit armoryWeapons pour accéder plus facilement à Armory
    const armoryWeapons = this.armory.weapons;

    // On dit que l'arme suivante est logiquement l'arme plus le sens donné
    const nextWeaponIndex = this.getActualWeapon().indexArmory + way;

    // on définit actuellement l'arme possible utilisable à 0 pour l'instant
    let nextPossibleWeaponIndex = null;

    // Si le sens est positif
    if (way > 0) {
      for (let index = nextWeaponIndex; index < nextWeaponIndex + armoryWeapons.length; index += 1) {
        // L'arme qu'on va tester sera un modulo de i et de la longueur de Weapon
        const numberWeapon = index % armoryWeapons.length;

        // On compare ce nombre aux armes qu'on a dans l'inventaire
        for (const [inventoryIndex, weaponInventory] of this.inventory.entries()) {
          if (numberWeapon === weaponInventory.indexArmory) {
            // On définit l'index de l'arme qu'on va tester
            nextPossibleWeaponIndex = inventoryIndex;
            break;
          }
        }

        if (nextPossibleWeaponIndex !== null) {
          break;
        }
      }
    } else {
      let index = nextWeaponIndex;
      let breakWhile = true;
      do {
        if (index < 0) {
          index = armoryWeapons.length;
        }
        const numberWeapon = index;
        for (const [inventoryIndex, weaponInventory] of this.inventory.entries()) {
          if (numberWeapon === weaponInventory.indexArmory) {
            // On définit l'index de l'arme qu'on va tester
            nextPossibleWeaponIndex = inventoryIndex;
            break;
          }
        }
        if (nextPossibleWeaponIndex !== null) {
          breakWhile = false;
        }
        index -= 1;
      } while (breakWhile);
    }

    if (this.actualWeaponIndex !== nextPossibleWeaponIndex) {
      this.inventory[this.actualWeaponIndex].isActive = false;
      this.actualWeaponIndex = nextPossibleWeaponIndex;
      this.inventory[this.actualWeaponIndex].isActive = true;

      // On actualise la cadence de l'arme
      this.fireRate = this.defineFireRate();
      this._deltaFireRate = this.fireRate;
    }
  }

  decrementeDelataFireRate() {
    this.player.scene.registerBeforeRender(() => {
      if (!this.canFire) {
        this._deltaFireRate -= this.engine.getDeltaTime();

        if (this._deltaFireRate <= 0 && this.player.isAlive) {
          this.canFire = true;
          this._deltaFireRate = this.fireRate;
        }
      }
    });
  }

  fire() {
    this.lauchBullets = true;
  }

  stopFire() {
    this.lauchBullets = false;
  }

  lauchFire() {
    if (this.canFire) {
      // id de l'arme en mains
      const { indexArmory: idWeapon } = this.getActualWeapon();

      // On récupère l'arme en question// Détermine la taille de l'écran
      const renderWidth = this.engine.getRenderWidth(true);
      const renderHeight = this.engine.getRenderHeight(true);

      const itemsNotContact = ['weapon', 'headMainPlayer', 'hitBoxPlayer'];

      // Cast d'un rayon au centre de l'écran
      const direction = this.player.scene.pick(renderWidth / 2, renderHeight / 2, (item) => !itemsNotContact.includes(item.name));

      this.defineTypeFire(idWeapon, direction);

      // this.createRocket();
      this.canFire = false;
    }
  }

  defineTypeFire(idWeapon, direction) {
    const weapon = this.armory.getWeaponById(idWeapon);
    let directionFire = direction;

    // Si l'arme est une arme de distance
    if (weapon.type === 'ranged') {
      switch (weapon.setup.ammos.type) {
        case 'rocket':
          // Nous devons tirer une roquette
          directionFire = directionFire.pickedPoint.subtractInPlace(this.player.camera.playerBox.position);
          directionFire = directionFire.normalize();
          this.createRocket(idWeapon, directionFire);
          break;
        case 'bullet':
          // Nous devons tirer des balles simples
          this.shootBullet(idWeapon, directionFire);
          break;
        case 'laser':
          // Nous devons tirer un laser
          this.createLaser(idWeapon, directionFire);
          break;
        default:
          // Nous devons tirer au laser
      }
    } else {
      //  Si ce n'est pas une arme à distance, il faut attaquer au corps-à-corps
      this.hitHand(idWeapon, directionFire);
    }
  }

  createRocket(idWeapon, direction) {
    const playerPosition = this.player.camera.playerBox;

    const actualWepon = this.getActualWeapon();

    const positionValue = actualWepon.absolutePosition.clone();
    const rotationValue = playerPosition.rotation;

    // les params de l'armes
    const weaponParams = this.armory.getWeaponById(idWeapon);

    const newRocket = BABYLON.MeshBuilder.CreateBox('rocket', 1, this.player.scene);

    newRocket.direction = direction;

    newRocket.position = new BABYLON.Vector3(
      positionValue.x + (newRocket.direction.x * 1),
      positionValue.y + (newRocket.direction.y * 1),
      positionValue.z + (newRocket.direction.z * 1),
    );

    newRocket.rotation = new BABYLON.Vector3(rotationValue.x, rotationValue.y, rotationValue.z);
    newRocket.scaling = new BABYLON.Vector3(0.5, 0.5, 1);
    newRocket.isPickable = false;

    newRocket.material = new BABYLON.StandardMaterial('rocketMaterial', this.player.scene);
    newRocket.material.diffuseColor = weaponParams.setup.colorMesh;

    // Paramètres récupéré depuis Armory
    newRocket.paramsRocket = weaponParams.setup;

    newRocket.isPickable = false;

    this.player.game.rockets.push(newRocket);
  }

  // eslint-disable-next-line class-methods-use-this
  shootBullet(idWeapon, direction) {
    if (direction.hit && direction.pickedMesh.isPlayer) {
      // On a touché un joueur
      console.log('Hit player');
    } else {
      // L'arme ne touche pas de joueur
      // eslint-disable-next-line no-console
      console.log('Not Hit Bullet');
    }
  }

  hitHand(idWeapon, direction) {
    // les params de l'armes
    const setupWeapon = this.armory.getWeaponById(idWeapon).setup;

    if (direction.hit
      && direction.distance < setupWeapon.range * 5
      && direction.pickedMesh.isPlayer) {
      // On a touché un joueur
      console.log('Hit player CaC');
    } else {
      // L'arme frappe dans le vide
      console.log('Not Hit CaC');
    }
  }

  createLaser(idWeapon, direction) {
    const actualWepon = this.getActualWeapon();

    const positionValue = actualWepon.absolutePosition.clone();

    if (direction.hit) {
      const laserPosition = positionValue;

      // On crée une ligne tracée entre le pickedPoint et le canon de l'arme
      const line = BABYLON.MeshBuilder.CreateLines('lines', { points: [laserPosition, direction.pickedPoint], radius: 0.2 }, this.player.scene);

      // on done une couleur aléatoire
      const colorLine = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
      line.color = colorLine;

      // On élargit le trait pour le rendre visible
      line.enableEdgesRendering();
      line.isPickable = false;
      line.edgesWidth = 40.0;
      line.edgesColor = new BABYLON.Color4(colorLine.r, colorLine.g, colorLine.b, 1);

      if (direction.pickedMesh.isPlayer) {
        // On inflige des dégâts au joueur
        console.log('Hit player Laser');
      }
      this.player.game.lasers.push(line);
    }
  }
}
