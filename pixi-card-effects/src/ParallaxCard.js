import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';

const ParallaxCard = ({ effect }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const layersRef = useRef({});
  const mountedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initializeOnce = async () => {
      if (mountedRef.current || !containerRef.current || !isMounted) return;
      mountedRef.current = true;

      try {
        const pixiApp = new PIXI.Application();
        await pixiApp.init({
          width: 600,
          height: 900,
          backgroundColor: 0x4a4a4a,
          antialias: true,
        });

        if (!isMounted) return;

        appRef.current = pixiApp;
        containerRef.current.appendChild(pixiApp.canvas);

        createPlaceholderCards(pixiApp);
        loadImagesAndReplace(pixiApp);

      } catch (error) {
        console.error('Failed to initialize PIXI app:', error);
        mountedRef.current = false;
      }
    };

    initializeOnce();

    return () => {
      isMounted = false;
      if (appRef.current && containerRef.current) {
        try {
          if (containerRef.current.contains(appRef.current.canvas)) {
            containerRef.current.removeChild(appRef.current.canvas);
          }
          appRef.current.destroy(true);
        } catch (e) {
        }
      }
      appRef.current = null;
      mountedRef.current = false;
    };
  }, []);

  // Create particles with color parameter
  const createParticles = (color = 'red', isBottomRow = false, isRightCard = false) => {
    const particles = [];

    let createLeftParticles = true;
    let createRightParticles = true;

    if (isBottomRow) {
      if (!isRightCard) {
        // Bottom left card 
        createRightParticles = false;
      } else {
        // Bottom right card 
        createLeftParticles = false;
      }
    }

    for (let i = 0; i < 30; i++) {
      const particle = new PIXI.Graphics();

      // Set particle color 
      if (color === 'blue') {
        particle.beginFill(0x6b6bff, 0.9);
      } else {
        particle.beginFill(0xff6b6b, 0.9);
      }

      particle.drawCircle(0, 0, Math.random() * 2 + 1);
      particle.endFill();

      // Add glow effect 
      const glowFilter = new PIXI.BlurFilter();
      glowFilter.blur = 2;
      particle.filters = [glowFilter];

      const isLeft = i < 15;

      // Skip particles on sides that don't have them
      if (isLeft && !createLeftParticles) continue;
      if (!isLeft && !createRightParticles) continue;

      if (isLeft) {
        // Left side 
        particle.x = -82 + (Math.random() - 0.5) * 50;
        particle.y = -120 + (Math.random() - 0.5) * 50;
      } else {
        // Right side 
        particle.x = 82 + (Math.random() - 0.5) * 50;
        particle.y = -120 + (Math.random() - 0.5) * 50;
      }

      // properties for animation
      particle.initialX = particle.x;
      particle.initialY = particle.y;
      particle.floatSpeed = Math.random() * 0.5 + 0.2;
      particle.floatOffset = Math.random() * Math.PI * 2;
      particle.alpha = Math.random() * 0.5 + 0.5;
      particle.baseAlpha = particle.alpha;

      particles.push(particle);
    }

    return particles;
  };

  const createGlowTexture = (radius = 40, color = 'red') => {
    const canvas = document.createElement('canvas');
    const size = radius * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);

    if (color === 'blue') {
      gradient.addColorStop(0, 'rgba(107, 107, 255, 0.8)');
      gradient.addColorStop(0.4, 'rgba(107, 107, 255, 0.4)');
      gradient.addColorStop(0.8, 'rgba(71, 87, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(71, 87, 255, 0)');
    } else if (color === 'purple') {
      gradient.addColorStop(0, 'rgba(186, 85, 211, 0.7)');
      gradient.addColorStop(0.3, 'rgba(138, 43, 226, 0.5)');
      gradient.addColorStop(0.7, 'rgba(75, 0, 130, 0.2)');
      gradient.addColorStop(1, 'rgba(75, 0, 130, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
      gradient.addColorStop(0.4, 'rgba(255, 107, 107, 0.4)');
      gradient.addColorStop(0.8, 'rgba(255, 71, 87, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 71, 87, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return PIXI.Texture.from(canvas);
  };

  // Create purple atmospheric effect for bottom cards
  const createPurpleAtmosphere = () => {
    const purpleTexture = createGlowTexture(80, 'purple');
    const atmosphere = new PIXI.Sprite(purpleTexture);
    atmosphere.anchor.set(0.5);
    atmosphere.x = 0;
    atmosphere.y = 200;
    atmosphere.alpha = 0.4;
    atmosphere.blendMode = 'add';
    atmosphere.scale.set(1.5);
    return atmosphere;
  };

  // Create shadow with option for cut corners
  const createCardShadow = (cutCorners = false) => {
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.4);

    if (cutCorners) {
      // Create shape with cut corners 
      const cornerSize = 15;
      shadow.moveTo(-100 + cornerSize, -140);
      shadow.lineTo(100 - cornerSize, -140);
      shadow.lineTo(100, -140 + cornerSize);
      shadow.lineTo(100, 140 - cornerSize);
      shadow.lineTo(100 - cornerSize, 140);
      shadow.lineTo(-100 + cornerSize, 140);
      shadow.lineTo(-100, 140 - cornerSize);
      shadow.lineTo(-100, -140 + cornerSize);
      shadow.lineTo(-100 + cornerSize, -140);
      shadow.closePath();
    } else {
      // top row cards
      shadow.drawRoundedRect(-100, -140, 200, 280, 10);
    }

    shadow.endFill();

    // Add blur filter
    const blurFilter = new PIXI.BlurFilter();
    blurFilter.blur = 4;
    shadow.filters = [blurFilter];

    return shadow;
  };

  // Create card mask for shine effect
  const createCardMask = (cutCorners = false) => {
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);

    if (cutCorners) {
      // Create shape with cut corners matching the card
      const cornerSize = 15;
      mask.moveTo(-100 + cornerSize, -140);
      mask.lineTo(100 - cornerSize, -140);
      mask.lineTo(100, -140 + cornerSize);
      mask.lineTo(100, 140 - cornerSize);
      mask.lineTo(100 - cornerSize, 140);
      mask.lineTo(-100 + cornerSize, 140);
      mask.lineTo(-100, 140 - cornerSize);
      mask.lineTo(-100, -140 + cornerSize);
      mask.lineTo(-100 + cornerSize, -140);
      mask.closePath();
    } else {
      // Top row cards - rounded rectangle
      mask.drawRoundedRect(-100, -140, 200, 280, 10);
    }

    mask.endFill();
    return mask;
  };

  // shine effect with proper masking
  const createShine = (isBottomRow = false) => {
    const shineContainer = new PIXI.Container();

    const shine = new PIXI.Graphics();

    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 240, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 240, 16);

    const shineTexture = PIXI.Texture.from(canvas);
    const shineSprite = new PIXI.Sprite(shineTexture);
    shineSprite.anchor.set(0.5);
    shineSprite.rotation = -0.3;
    shineSprite.alpha = 0;
    shineSprite.blendMode = 'add';

    shineContainer.addChild(shineSprite);

    // Create and apply mask based on card type
    const mask = createCardMask(isBottomRow);
    shineContainer.addChild(mask);
    shineContainer.mask = mask;

    return { container: shineContainer, sprite: shineSprite, mask };
  };

  const createSingleCard = (xPosition, yPosition, isBottomRow = false, isRightCard = false) => {
    const cardContainer = new PIXI.Container();
    cardContainer.x = xPosition;
    cardContainer.y = yPosition;

    // Create shadow with appropriate shape 
    const shadow = createCardShadow(isBottomRow);
    shadow.x = -20;
    shadow.y = 20;
    shadow.alpha = 0.6;
    cardContainer.addChild(shadow);

    // Choose glow color and position
    const glowColor = isBottomRow ? 'blue' : 'red';
    const glowTexture = createGlowTexture(40, glowColor);

    let glowTopLeft = null;
    let glowTopRight = null;

    if (isBottomRow) {
      // Bottom row
      if (!isRightCard) {
        // Bottom left 
        glowTopLeft = new PIXI.Sprite(glowTexture);
        glowTopLeft.anchor.set(0.5);
        glowTopLeft.x = -85;
        glowTopLeft.y = -110;
        glowTopLeft.blendMode = 'add';
        cardContainer.addChild(glowTopLeft);
      } else {
        // Bottom right 
        glowTopRight = new PIXI.Sprite(glowTexture);
        glowTopRight.anchor.set(0.5);
        glowTopRight.x = 85;
        glowTopRight.y = -110;
        glowTopRight.blendMode = 'add';
        cardContainer.addChild(glowTopRight);
      }
    } else {
      // Top row
      glowTopLeft = new PIXI.Sprite(glowTexture);
      glowTopLeft.anchor.set(0.5);
      glowTopLeft.x = -85;
      glowTopLeft.y = -110;
      glowTopLeft.blendMode = 'add';

      glowTopRight = new PIXI.Sprite(glowTexture);
      glowTopRight.anchor.set(0.5);
      glowTopRight.x = 85;
      glowTopRight.y = -110;
      glowTopRight.blendMode = 'add';

      cardContainer.addChild(glowTopLeft);
      cardContainer.addChild(glowTopRight);
    }

    // Create placeholder graphics
    const base = new PIXI.Graphics();
    base.beginFill(0x5a5a5a);
    base.drawRoundedRect(-100, -140, 200, 280, 10);
    base.endFill();

    const character = new PIXI.Graphics();
    character.beginFill(0x7b6ba5);
    character.drawRoundedRect(-80, -100, 160, 120, 8);
    character.endFill();
    character.y = -40;

    // Create shine effect with proper masking
    const shineData = createShine(isBottomRow);

    // Create purple atmosphere effect 
    let purpleAtmosphere = null;
    if (isBottomRow) {
      purpleAtmosphere = createPurpleAtmosphere();
      cardContainer.addChild(purpleAtmosphere);
    }

    // Create particles with appropriate color
    const particleColor = isBottomRow ? 'blue' : 'red';
    const particles = createParticles(particleColor, isBottomRow, isRightCard);

    // Add particles
    particles.forEach(particle => cardContainer.addChild(particle));

    cardContainer.addChild(base);
    cardContainer.addChild(character);
    cardContainer.addChild(shineData.container);

    return {
      container: cardContainer,
      base,
      character,
      glowTopLeft,
      glowTopRight,
      shadow,
      shine: shineData.sprite,
      shineContainer: shineData.container,
      shineMask: shineData.mask,
      particles,
      purpleAtmosphere
    };
  };

  const createPlaceholderCards = (app) => {
    // Create card (left top )
    const mainCard = createSingleCard(150, 300, false, false);
    app.stage.addChild(mainCard.container);

    // Create card (right top)
    const cardBack = createSingleCard(450, 300, false, true);
    app.stage.addChild(cardBack.container);

    // Create card (left bottom) 
    const secondCard = createSingleCard(150, 600, true, false);
    app.stage.addChild(secondCard.container);

    // Create card (right bottom) 
    const secondCardBack = createSingleCard(450, 600, true, true);
    app.stage.addChild(secondCardBack.container);

    layersRef.current = {
      mainCard,
      cardBack,
      secondCard,
      secondCardBack
    };

    app.stage.interactive = true;
    app.stage.on('mousemove', (event) => handleMouseMove(event, mainCard, cardBack, secondCard, secondCardBack));
  };

  const loadImagesAndReplace = async (app) => {
    try {
      const [
        baseTexture,
        characterTexture,
        cardBackTexture,
        secondBaseTexture,
        secondBgTexture,
        secondCharacterTexture,
        secondBackTexture
      ] = await Promise.all([
        PIXI.Assets.load('./card_base.png'),
        PIXI.Assets.load('./card_character.png'),
        PIXI.Assets.load('./card_back.png'),
        PIXI.Assets.load('./2card_front.png'),
        PIXI.Assets.load('./2card_frontbg.png'),
        PIXI.Assets.load('./2card_character.png'),
        PIXI.Assets.load('./2card_back.png')
      ]);

      const { mainCard, cardBack, secondCard, secondCardBack } = layersRef.current;
      if (!mainCard || !cardBack || !secondCard || !secondCardBack) return;

      // Replace placeholders (top left)
      replaceCardContent(mainCard, baseTexture, characterTexture, false);

      // Replace placeholders (top right)
      replaceCardContent(cardBack, cardBackTexture, null, false);

      // Replace placeholders (bottom left)
      replaceCardContentWithBg(secondCard, secondBaseTexture, secondBgTexture, secondCharacterTexture, true);

      // Replace back placeholders (bottom right) 
      replaceCardContent(secondCardBack, secondBackTexture, null, true);

      console.log('Successfully loaded custom card images!');

    } catch (error) {
      console.log('Could not load custom images, keeping placeholders');
    }
  };

  const replaceCardContent = (cardData, baseTexture, characterTexture, useSmallScale = false) => {
    const { container, glowTopLeft, glowTopRight, shadow, shineContainer, particles } = cardData;

    container.removeChildren();

    // Re-add all elements in order
    container.addChild(shadow);
    if (glowTopLeft) container.addChild(glowTopLeft);
    if (glowTopRight) container.addChild(glowTopRight);

    // Add particles 
    if (particles) {
      particles.forEach(particle => container.addChild(particle));
    }

    const scale = useSmallScale ? 0.25 : 0.5;
    const base = new PIXI.Sprite(baseTexture);
    base.anchor.set(0.5);
    base.scale.set(scale);

    container.addChild(base);

    let character = null;
    if (characterTexture) {
      character = new PIXI.Sprite(characterTexture);
      character.anchor.set(0.5);
      character.scale.set(scale);
      character.y = -40;
      container.addChild(character);
    }

    container.addChild(shineContainer);

    // Update the card data 
    cardData.base = base;
    cardData.character = character;
    cardData.baseScale = scale;
  };

  const replaceCardContentWithBg = (cardData, baseTexture, bgTexture, characterTexture, characterBelowBase = false) => {
    const { container, glowTopLeft, glowTopRight, shadow, shineContainer, particles } = cardData;

    container.removeChildren();

    // Re-add all elements in order
    container.addChild(shadow);
    if (glowTopLeft) container.addChild(glowTopLeft);
    if (glowTopRight) container.addChild(glowTopRight);

    // Add particles 
    if (particles) {
      particles.forEach(particle => container.addChild(particle));
    }

    // Add background first
    const background = new PIXI.Sprite(bgTexture);
    background.anchor.set(0.5);
    background.scale.set(0.25);
    container.addChild(background);

    // Add character 
    let character = null;
    if (characterTexture && characterBelowBase) {
      character = new PIXI.Sprite(characterTexture);
      character.anchor.set(0.5);
      character.scale.set(0.25);
      character.y = 1;
      container.addChild(character);
    }

    // Add base/front 
    const base = new PIXI.Sprite(baseTexture);
    base.anchor.set(0.5);
    base.scale.set(0.25);
    container.addChild(base);

    // Add character 
    if (characterTexture && !characterBelowBase) {
      character = new PIXI.Sprite(characterTexture);
      character.anchor.set(0.5);
      character.scale.set(0.25);
      character.y = -40;
      container.addChild(character);
    }

    container.addChild(shineContainer);

    // Update the card data 
    cardData.base = base;
    cardData.character = character;
    cardData.background = background;
    cardData.baseScale = 0.25;
  };

  const handleMouseMove = (event, mainCard, cardBack, secondCard, secondCardBack) => {
    const mousePos = event.data.global;

    // Handle card (top left)
    const mainCardBounds = {
      x: mainCard.container.x - 100,
      y: mainCard.container.y - 140,
      width: 200,
      height: 280
    };

    const isOverMain = (
      mousePos.x >= mainCardBounds.x &&
      mousePos.x <= mainCardBounds.x + mainCardBounds.width &&
      mousePos.y >= mainCardBounds.y &&
      mousePos.y <= mainCardBounds.y + mainCardBounds.height
    );

    // Handle card (top right)
    const cardBackBounds = {
      x: cardBack.container.x - 100,
      y: cardBack.container.y - 140,
      width: 200,
      height: 280
    };

    const isOverBack = (
      mousePos.x >= cardBackBounds.x &&
      mousePos.x <= cardBackBounds.x + cardBackBounds.width &&
      mousePos.y >= cardBackBounds.y &&
      mousePos.y <= cardBackBounds.y + cardBackBounds.height
    );

    // Handle card (bottom left)
    const secondCardBounds = {
      x: secondCard.container.x - 100,
      y: secondCard.container.y - 140,
      width: 200,
      height: 280
    };

    const isOverSecond = (
      mousePos.x >= secondCardBounds.x &&
      mousePos.x <= secondCardBounds.x + secondCardBounds.width &&
      mousePos.y >= secondCardBounds.y &&
      mousePos.y <= secondCardBounds.y + secondCardBounds.height
    );

    // Handle card (bottom right)
    const secondCardBackBounds = {
      x: secondCardBack.container.x - 100,
      y: secondCardBack.container.y - 140,
      width: 200,
      height: 280
    };

    const isOverSecondBack = (
      mousePos.x >= secondCardBackBounds.x &&
      mousePos.x <= secondCardBackBounds.x + secondCardBackBounds.width &&
      mousePos.y >= secondCardBackBounds.y &&
      mousePos.y <= secondCardBackBounds.y + secondCardBounds.height
    );

    if (isOverMain) {
      const centerX = mainCardBounds.x + mainCardBounds.width / 2;
      const centerY = mainCardBounds.y + mainCardBounds.height / 2;
      const relativeX = (mousePos.x - centerX) / (mainCardBounds.width / 2);
      const relativeY = (mousePos.y - centerY) / (mainCardBounds.height / 2);
      applyEffect(mainCard, relativeX, relativeY);
      applyEffect(cardBack, 0, 0);
      applyEffect(secondCard, 0, 0);
      applyEffect(secondCardBack, 0, 0);
    } else if (isOverBack) {
      const centerX = cardBackBounds.x + cardBackBounds.width / 2;
      const centerY = cardBackBounds.y + cardBackBounds.height / 2;
      const relativeX = (mousePos.x - centerX) / (cardBackBounds.width / 2);
      const relativeY = (mousePos.y - centerY) / (cardBackBounds.height / 2);
      applyEffect(cardBack, relativeX, relativeY);
      applyEffect(mainCard, 0, 0);
      applyEffect(secondCard, 0, 0);
      applyEffect(secondCardBack, 0, 0);
    } else if (isOverSecond) {
      const centerX = secondCardBounds.x + secondCardBounds.width / 2;
      const centerY = secondCardBounds.y + secondCardBounds.height / 2;
      const relativeX = (mousePos.x - centerX) / (secondCardBounds.width / 2);
      const relativeY = (mousePos.y - centerY) / (secondCardBounds.height / 2);
      applyEffect(secondCard, relativeX, relativeY);
      applyEffect(mainCard, 0, 0);
      applyEffect(cardBack, 0, 0);
      applyEffect(secondCardBack, 0, 0);
    } else if (isOverSecondBack) {
      const centerX = secondCardBackBounds.x + secondCardBackBounds.width / 2;
      const centerY = secondCardBackBounds.y + secondCardBackBounds.height / 2;
      const relativeX = (mousePos.x - centerX) / (secondCardBackBounds.width / 2);
      const relativeY = (mousePos.y - centerY) / (secondCardBackBounds.height / 2);
      applyEffect(secondCardBack, relativeX, relativeY);
      applyEffect(mainCard, 0, 0);
      applyEffect(cardBack, 0, 0);
      applyEffect(secondCard, 0, 0);
    } else {
      applyEffect(mainCard, 0, 0);
      applyEffect(cardBack, 0, 0);
      applyEffect(secondCard, 0, 0);
      applyEffect(secondCardBack, 0, 0);
    }
  };

  const applyEffect = (cardData, x, y) => {
    const { base, character, background, baseScale, glowTopLeft, glowTopRight, shadow, shine, particles } = cardData;
    if (!base) return;

    const maxRotX = 0.2;
    const maxRotY = 0.15;
    const rotY = x * maxRotY;
    const rotX = -y * maxRotX;


    const intendedScale = baseScale || 0.5;
    const scaleMultiplier = intendedScale === 0.25 ? 0.01 : 0.02;

    // Background layer 
    if (background) {
      background.skew.set(rotY * 0.2, rotX * 0.2);
      background.scale.set(0.25 + Math.abs(x + y) * 0.005);
      background.x = x * 2;
      background.y = y * 1.5;
    }

    // Base layer 
    base.skew.set(rotY * 0.3, rotX * 0.3);
    base.scale.set(intendedScale + Math.abs(x + y) * scaleMultiplier);

    // Character layer 
    if (character) {
      character.skew.set(rotY * 0.35, rotX * 0.35);
      character.scale.set(intendedScale + Math.abs(x + y) * (scaleMultiplier * 1.25));
      character.x = x * 1.5;
      const baseCharacterY = cardData === layersRef.current.secondCard ? 1 : -40;
      character.y = baseCharacterY + y * 1.5;
    }

    // glow effects 
    const intensity = Math.sqrt(x * x + y * y);
    const baseAlpha = 0.6 + intensity * 0.3;
    const scaleEffect = 1 + intensity * 0.1;

    if (glowTopLeft) {
      glowTopLeft.alpha = baseAlpha;
      glowTopLeft.scale.set(scaleEffect);
    }

    if (glowTopRight) {
      glowTopRight.alpha = baseAlpha;
      glowTopRight.scale.set(scaleEffect);
    }

    // Shadow effects 
    if (shadow) {
      const shadowIntensity = intensity * 0.1;
      shadow.alpha = 0.4 + shadowIntensity;
    }

    if (shine) {
      shine.y = y * 120;
      shine.alpha = intensity * 0.4;
    }

    if (particles) {
      const time = Date.now() * 0.001;
      particles.forEach((particle, i) => {
        // floating animation
        particle.x = particle.initialX + Math.sin(time * particle.floatSpeed + particle.floatOffset) * 4;
        particle.y = particle.initialY + Math.cos(time * particle.floatSpeed * 0.7 + particle.floatOffset) * 3;

        particle.alpha = particle.baseAlpha + Math.sin(time * 2 + i) * 0.2 + (intensity * 0.3);

        particle.x += x * 3;
        particle.y += y * 2;
      });
    }
  };

  return (
    <div>
      <h2>And my own art.</h2>
      <div ref={containerRef} style={{ border: '1px solid #ccc', margin: '20px 0' }} />
    </div>
  );
};

export default ParallaxCard;