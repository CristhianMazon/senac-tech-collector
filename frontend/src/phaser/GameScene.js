import Phaser from 'phaser';
import * as Tone from 'tone';

// A função que desenhava as formas não é mais necessária!
// function generateShapeTextures(scene) { ... }

function criarItem(scene, itemsGroup, bonusGroup, badItemGroup, itemTypes, pontuacao) {
  const x = Phaser.Math.Between(50, scene.cameras.main.width - 50);
  const chance = Phaser.Math.Between(1, 20);
  let itemKey;
  let group;

  if (chance <= 2) {
    itemKey = 'senac';
    group = bonusGroup;
  } else if (chance <= 4) {
    itemKey = 'relogio';
    group = bonusGroup;
  } else if (chance <= 7) {
    itemKey = 'virus';
    group = badItemGroup;
  } else {
    itemKey = Phaser.Math.RND.pick(itemTypes);
    group = itemsGroup;
  }

  const item = group.create(x, -50, itemKey);

  // ==================================================================
  // Tamanhos diferentes para cada item
  // ==================================================================
  // Revertido para os valores fixos originais
  if (itemKey === 'senac') {
    item.setScale(0.2); // Um tamanho bom para a logo
  } else {
    item.setScale(0.07); // Um tamanho maior para os outros itens
  }
  // ==================================================================


  let currentVelocity = 100 + (pontuacao * 1.5);
  item.setVelocityY(Math.min(currentVelocity, 500));
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
    this.onGameOver = data.onGameOver;
  }

  preload() {
    // Carregar a nova imagem de fundo
    this.load.image('fundoJogo', 'assets/FundoJogo.png');

    this.load.image('computador', 'assets/MonitorSenac.png');
    this.load.image('mouse', 'assets/MouseSenac.png');
    this.load.image('teclado', 'assets/TecladoSenac.png');
    this.load.image('relogio', 'assets/RelogioSenac.png');
    this.load.image('virus', 'assets/VirusSenac.png');
    this.load.image('senac', 'assets/LogoSenac.png');

    const graphics = this.make.graphics();
    graphics.fillStyle(0x00a9e0, 1);
    graphics.fillCircle(5, 5, 5);
    graphics.generateTexture('particle', 10, 10);
    graphics.destroy();
  }

  create() {
    // Adicionar a imagem de fundo e ajustá-la para preencher a tela
    const { width, height } = this.cameras.main;
    const background = this.add.image(0, 0, 'fundoJogo').setOrigin(0);
    background.displayWidth = width;
    background.displayHeight = height;
    
    // CORREÇÃO: Mover o fundo para trás e garantir que ele não capture eventos de entrada
    background.setDepth(-1);
    background.disableInteractive();

    this.pontuacao = 0;
    this.tempoRestante = 60;
    this.stats = { computador: 0, mouse: 0, teclado: 0, senac: 0, relogio: 0, virus: 0 };
    
    this.game.events.emit('updateUI', { score: this.pontuacao, time: this.tempoRestante });

    this.sounds = {
        collect: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 } }).toDestination(),
        bonus: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 } }).toDestination(),
        negative: new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 } }).toDestination(),
    };

    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    
    this.itemsGroup = this.physics.add.group();
    this.bonusGroup = this.physics.add.group();
    this.badItemGroup = this.physics.add.group();
    const itemTypes = ['computador', 'mouse', 'teclado'];

    this.itemSpawner = this.time.addEvent({
      delay: 800,
      callback: () => criarItem(this, this.itemsGroup, this.bonusGroup, this.badItemGroup, itemTypes, this.pontuacao),
      loop: true
    });

    this.gameTimer = this.time.addEvent({ // Correção: remova o '.event'
      delay: 1000,
      callback: () => {
        this.tempoRestante--;
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
              this.game.events.emit('updateUI', { time: this.tempoRestante });
              itemColetado(this, gameObject, this.pontuacao, 0, this.stats, this.sounds.bonus, "A5");
          }
      } else if (this.badItemGroup.contains(gameObject)) {
          valor = -15;
          this.pontuacao = itemColetado(this, gameObject, this.pontuacao, valor, this.stats, this.sounds.negative, "C2");
      }
      
      this.game.events.emit('updateUI', { score: this.pontuacao });
    });
  }

  update() {
    this.physics.world.bodies.each(body => {
      if (body.gameObject && body.gameObject.y > this.cameras.main.height + 100) {
        body.gameObject.destroy();
      }
    });
  }
}
