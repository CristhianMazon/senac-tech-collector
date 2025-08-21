import Phaser from 'phaser';
import * as Tone from 'tone';

// --- Funções Auxiliares do Jogo ---

function generateShapeTextures(scene) {
    if (scene.textures.exists('computador')) return;
    let graphics;
    const hubColor = 0x00a9e0;

    // Computador (monitor)
    graphics = scene.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(0, 0, 60, 45, 5);
    graphics.fillStyle(hubColor, 1);
    graphics.fillRect(5, 5, 50, 35);
    graphics.fillStyle(0x555555, 1);
    graphics.fillRect(25, 45, 10, 10);
    graphics.generateTexture('computador', 60, 55);
    graphics.destroy();

    // ==================================================================
    // FIX 1: Adicionado o código para desenhar o mouse e o teclado.
    // ==================================================================
    // Mouse
    graphics = scene.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillEllipse(22, 27, 40, 50);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(20, 25, 40, 50);
    graphics.fillStyle(0xaaaaaa, 1);
    graphics.fillRect(18, 15, 4, 10);
    graphics.generateTexture('mouse', 44, 54);
    graphics.destroy();
    
    // Teclado
    graphics = scene.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0x555555, 1);
    graphics.fillRoundedRect(0, 0, 80, 30, 3);
    graphics.fillStyle(0xdddddd, 1);
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 2; j++) {
            graphics.fillRoundedRect(5 + i * 18, 5 + j * 12, 15, 8, 2);
        }
    }
    graphics.generateTexture('teclado', 80, 30);
    graphics.destroy();
    // ==================================================================

    // Senac Logo
    graphics = scene.make.graphics({x: 0, y: 0, add: false});
    graphics.lineStyle(6, hubColor, 1);
    const path1 = new Phaser.Curves.Path().moveTo(10, 20).lineTo(30, 10).lineTo(50, 20);
    path1.draw(graphics);
    const path2 = new Phaser.Curves.Path().moveTo(10, 30).lineTo(30, 20).lineTo(50, 30);
    path2.draw(graphics);
    graphics.generateTexture('senac', 60, 40);
    graphics.destroy();

    // Vírus
    graphics = scene.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(25, 25, 20);
    graphics.lineStyle(4, 0xcc0000, 1);
    for(let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        graphics.moveTo(25, 25);
        graphics.lineTo(25 + Math.cos(angle) * 25, 25 + Math.sin(angle) * 25);
    }
    graphics.strokePath();
    graphics.generateTexture('virus', 50, 50);
    graphics.destroy();

    // Relógio
    graphics = scene.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.lineStyle(4, 0x333333, 1);
    graphics.beginPath();
    graphics.moveTo(25, 25);
    graphics.lineTo(25, 10);
    graphics.strokePath();
    graphics.lineStyle(2, 0x333333, 1);
    graphics.beginPath();
    graphics.moveTo(25, 25);
    graphics.lineTo(40, 25);
    graphics.strokePath();
    graphics.generateTexture('relogio', 50, 50);
    graphics.destroy();

    // Partícula para efeito
    graphics = scene.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(hubColor, 1);
    graphics.fillCircle(5, 5, 5);
    graphics.generateTexture('particle', 10, 10);
    graphics.destroy();
}

function criarItem(scene, itemsGroup, bonusGroup, badItemGroup, itemTypes, pontuacao) {
  const x = Phaser.Math.Between(50, scene.cameras.main.width - 50);
  const chance = Phaser.Math.Between(1, 20);
  let item;
  if (chance <= 2) {
    item = bonusGroup.create(x, -50, 'senac');
  } else if (chance <= 4) {
    item = bonusGroup.create(x, -50, 'relogio');
  } else if (chance <= 7) {
    item = badItemGroup.create(x, -50, 'virus');
  } else {
    const randomItem = Phaser.Math.RND.pick(itemTypes);
    item = itemsGroup.create(x, -50, randomItem);
  }
  let currentVelocity = 150 + (pontuacao * 1.5);
  item.setVelocityY(Math.min(currentVelocity, 800));
  item.setInteractive({ useHandCursor: true });
  item.setAngularVelocity(Phaser.Math.Between(-50, 50));
}

function itemColetado(scene, gameObject, pontuacao, valor, stats, sound, note) {
  const itemKey = gameObject.texture.key;
  if (stats.hasOwnProperty(itemKey)) {
      stats[itemKey]++;
  }
  sound.triggerAttackRelease(note, "8n");
  if (valor < 0) {
      scene.cameras.main.shake(100, 0.01);
  }
  const emitter = scene.add.particles(gameObject.x, gameObject.y, 'particle', {
      speed: 150,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      gravityY: 200
  });
  gameObject.destroy();
  setTimeout(() => emitter.destroy(), 500);
  let novaPontuacao = pontuacao + valor;
  return Math.max(0, novaPontuacao);
}


// --- Classe da Cena Principal do Jogo ---

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    // Recebe a função de callback do React para chamar quando o jogo acabar
    this.onGameOver = data.onGameOver;
  }

// Dentro de frontend/src/phaser/GameScene.js, na classe GameScene

  create() {
    this.pontuacao = 0;
    this.tempoRestante = 60;
    this.stats = { computador: 0, mouse: 0, teclado: 0, senac: 0, relogio: 0, virus: 0 };

    // Dispara um evento para a UI do React saber os valores iniciais
    // MUDANÇA AQUI: this.events -> this.game.events
    this.game.events.emit('updateUI', { score: this.pontuacao, time: this.tempoRestante });

    generateShapeTextures(this);

    // Configuração dos sons com Tone.js
    this.sounds = {
        collect: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 } }).toDestination(),
        bonus: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 } }).toDestination(),
        negative: new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 } }).toDestination(),
    };

    if (Tone.context.state !== 'running') {
        Tone.start();
    }

    // Grupos de itens
    this.itemsGroup = this.physics.add.group();
    this.bonusGroup = this.physics.add.group();
    this.badItemGroup = this.physics.add.group();
    const itemTypes = ['computador', 'mouse', 'teclado'];

    // Spawner de itens
    this.itemSpawner = this.time.addEvent({
      delay: 800,
      callback: () => criarItem(this, this.itemsGroup, this.bonusGroup, this.badItemGroup, itemTypes, this.pontuacao),
      loop: true
    });

    // Timer do jogo
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.tempoRestante--;
        // MUDANÇA AQUI: this.events -> this.game.events
        this.game.events.emit('updateUI', { time: this.tempoRestante });

        if (this.tempoRestante <= 0) {
          this.gameTimer.destroy();
          this.itemSpawner.destroy();
          this.scene.pause();
          
          if (this.onGameOver) {
            this.onGameOver(this.pontuacao, this.stats);
          }
        }
      },
      loop: true
    });

    // Evento de clique nos itens
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      let valor = 0;
      let itemKey = gameObject.texture.key;

      if (this.itemsGroup.contains(gameObject)) {
          valor = 10;
          this.pontuacao = itemColetado(this, gameObject, this.pontuacao, valor, this.stats, this.sounds.collect, "C5");
      } else if (this.bonusGroup.contains(gameObject)) {
          if (itemKey === 'senac') {
              valor = 20;
              this.pontuacao = itemColetado(this, gameObject, this.pontuacao, valor, this.stats, this.sounds.bonus, "G5");
          } else if (itemKey === 'relogio') {
              this.tempoRestante += 5;
              // MUDANÇA AQUI: this.events -> this.game.events
              this.game.events.emit('updateUI', { time: this.tempoRestante });
              itemColetado(this, gameObject, this.pontuacao, 0, this.stats, this.sounds.bonus, "A5");
          }
      } else if (this.badItemGroup.contains(gameObject)) {
          valor = -15;
          this.pontuacao = itemColetado(this, gameObject, this.pontuacao, valor, this.stats, this.sounds.negative, "C2");
      }
      
      // MUDANÇA AQUI: this.events -> this.game.events
      this.game.events.emit('updateUI', { score: this.pontuacao });
    });
  }

  update() {
    // Limpa itens que saíram da tela
    this.physics.world.bodies.each(body => {
      if (body.gameObject && body.gameObject.y > this.cameras.main.height + 100) {
        body.gameObject.destroy();
      }
    });
  }
}