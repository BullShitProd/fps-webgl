import * as BABYLON from 'babylonjs';

export default class Weapons {
  constructor(player) {
    // On permet d'accéder à Player n'importe où dans Weapons
    this.player = player;
    // Engine va nous être utile pour la cadence de tir
    this.engine = this.player.scene.getEngine();

    // Positions selon l'arme non utilisée
    this.bottomPosition = new BABYLON.Vector3(0.5, -2.5, 1);

    // Changement de Y quand l'arme est séléctionnée
    this.topPositionY = -0.5;

    // Créons notre arme
    this.rocketLauncher = this.createNewWeapon();

    // Cadence de tir
    this.fireRate = 800;

    // Delta de calcul pour savoir quand le tir est à nouveau disponible
    this._deltaFireRate = this.fireRate;

    // Variable qui va changer selon le temps
    this.canFire = true;

    // Params qui changera à 'ppel du tir depuis le player
    this.lauchBullets = false;

    this.decrementeDelataFireRate();
  }

  createNewWeapon() {
    const newWeapon = BABYLON.MeshBuilder.CreateBox('rocketLauncher', { size: 0.5, sideOrientation: 2 }, this.player.scene);

    // Nous faisons en sorte d'avoir une arme d'apparence plus longue que large
    newWeapon.scaling = new BABYLON.Vector3(1, 0.7, 2);
    // On l'associe à la caméra pour qu'il bouge de la même facon
    newWeapon.parent = this.player.camera;
    // On positionne le mesh APRES l'avoir attaché à la caméra
    newWeapon.position = this.bottomPosition.clone();
    newWeapon.position.y = this.topPositionY;

    // Ajoutons un material Rouge pour le rendre plus visible
    const materialWeapon = new BABYLON.StandardMaterial('rockerLaucherMaterial', this.player.scene);
    materialWeapon.diffuseColor = new BABYLON.Color3(1, 0, 0);

    newWeapon.material = materialWeapon;
    return newWeapon;
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
      // const renderWidth = this.engine.getRenderWidth(true);
      // const renderHeight = this.engine.getRenderHeight(true);

      // let direction = this.player.scene.pick(renderWidth / 2, renderHeight / 2);
      // direction = direction.pickedPoint.subtractInPlace(this.player.camera.position);
      // direction = direction.normalize();

      this.createRocket();
      this.canFire = false;
    }
  }

  createRocket() {
    const playerPostion = this.player.camera.playerBox;

    const positionValue = this.rocketLauncher.absolutePosition.clone();
    const rotationValue = playerPostion.rotation;

    const newRocket = BABYLON.MeshBuilder.CreateBox('rocket', 1, this.player.scene);

    newRocket.direction = new BABYLON.Vector3(
      Math.sin(rotationValue.y) * Math.cos(rotationValue.x),
      Math.sin(-rotationValue.x),
      Math.cos(rotationValue.y) * Math.cos(rotationValue.x),
    );

    newRocket.position = new BABYLON.Vector3(
      positionValue.x + (newRocket.direction.x * 1),
      positionValue.y + (newRocket.direction.y * 1),
      positionValue.z + (newRocket.direction.z * 1),
    );

    newRocket.rotation = new BABYLON.Vector3(rotationValue.x, rotationValue.y, rotationValue.z);
    newRocket.scaling = new BABYLON.Vector3(0.5, 0.5, 1);
    newRocket.isPickable = false;

    newRocket.material = new BABYLON.StandardMaterial('rocketMaterial', this.player.scene);
    newRocket.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

    newRocket.registerAfterRender(() => {
      // On bouge la roquette vers l'avant
      newRocket.translate(new BABYLON.Vector3(0, 0, 1.5), 1.5, 0);

      // On crée un rayon qui part de la base de la roquette vers l'avant
      const rayRocket = new BABYLON.Ray(newRocket.position, newRocket.direction);

      // On regarde quel est le premier objet qu'on touche
      const meshFound = newRocket.getScene().pickWithRay(rayRocket);

      // Si la distance au premier objet touché est inférieure a 10, on détruit la roquette
      if (!meshFound || meshFound.distance < 10) {
        this.explosionRocket(meshFound);
        // newRocket.dispose();
      }
    });
  }

  explosionRocket(meshFound) {
    // On vérifie qu'on a bien touché quelque chose
    if (meshFound.pickedMesh) {
      // On crée une sphere qui représentera la zone d'impact
      const explosionRadius = BABYLON.MeshBuilder.CreateSphere('explosionRadius', { segments: 5.0, diameter: 20 }, this.player.scene);
      // On positionne la sphère là où il y a eu impact
      explosionRadius.position = meshFound.pickedPoint;
      // On fait en sorte que les explosions ne soient pas considérées pour le Ray de la roquette
      explosionRadius.isPickable = false;

      // On crée un petit material orange
      explosionRadius.material = new BABYLON.StandardMaterial('textureExplosion', this.player.game.scene);
      explosionRadius.material.diffuseColor = new BABYLON.Color3(1, 0.6, 0);
      explosionRadius.material.specularColor = new BABYLON.Color3(0, 0, 0);
      explosionRadius.material.alpha = 0.8;

      // Chaque frame, on baisse l'opacité et on efface l'objet quand l'alpha est arrivé à 0
      explosionRadius.registerAfterRender(() => {
        explosionRadius.material.alpha -= 0.02;
        if (explosionRadius.material.alpha <= 0) {
          // explosionRadius.dispose();
        }
      });
    }
  }
}
