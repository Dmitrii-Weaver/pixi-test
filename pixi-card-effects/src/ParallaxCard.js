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
          width: 400,
          height: 600,
          backgroundColor: 0x2c2c2c,
          antialias: true,
        });

        if (!isMounted) return; 

        appRef.current = pixiApp;
        containerRef.current.appendChild(pixiApp.canvas);

        createPlaceholderCard(pixiApp);
        
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

  //gradient glow texture
  const createGlowTexture = (radius = 40) => {
    const canvas = document.createElement('canvas');
    const size = radius * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)'); 
    gradient.addColorStop(0.4, 'rgba(255, 107, 107, 0.4)'); 
    gradient.addColorStop(0.8, 'rgba(255, 71, 87, 0.1)'); 
    gradient.addColorStop(1, 'rgba(255, 71, 87, 0)'); 
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return PIXI.Texture.from(canvas);
  };

  const createPlaceholderCard = (app) => {
    const cardContainer = new PIXI.Container();
    cardContainer.x = 200;
    cardContainer.y = 300;
    app.stage.addChild(cardContainer);

    const glowTexture = createGlowTexture(40);

    const glowTopLeft = new PIXI.Sprite(glowTexture);
    glowTopLeft.anchor.set(0.5);
    glowTopLeft.x = -85;
    glowTopLeft.y = -110;
    glowTopLeft.blendMode = 'add'; 

    const glowTopRight = new PIXI.Sprite(glowTexture);
    glowTopRight.anchor.set(0.5);
    glowTopRight.x = 85;
    glowTopRight.y = -110;
    glowTopRight.blendMode = 'add';

    // Create placeholder graphics
    const base = new PIXI.Graphics();
    base.beginFill(0x4a4a4a);
    base.drawRoundedRect(-100, -140, 200, 280, 10);
    base.endFill();

    const character = new PIXI.Graphics();
    character.beginFill(0x6b5b95);
    character.drawRoundedRect(-80, -100, 160, 120, 8);
    character.endFill();
    character.y = -40;

    cardContainer.addChild(glowTopLeft);
    cardContainer.addChild(glowTopRight);
    cardContainer.addChild(base);
    cardContainer.addChild(character);

    layersRef.current = { base, character, glowTopLeft, glowTopRight, container: cardContainer };


    app.stage.interactive = true;
    app.stage.on('mousemove', (event) => handleMouseMove(event, cardContainer));
  };

  const loadImagesAndReplace = async (app) => {
    try {
      const [baseTexture, characterTexture] = await Promise.all([
        PIXI.Assets.load('./card_base.png'),
        PIXI.Assets.load('./card_character.png')
      ]);

      // Replace placeholders with actual images
      const { container, glowTopLeft, glowTopRight } = layersRef.current;
      if (!container) return;

      container.removeChildren();

      container.addChild(glowTopLeft);
      container.addChild(glowTopRight);

      const base = new PIXI.Sprite(baseTexture);
      base.anchor.set(0.5);
      base.scale.set(0.5);

      const character = new PIXI.Sprite(characterTexture);
      character.anchor.set(0.5);
      character.scale.set(0.5);
      character.y = -40;

      container.addChild(base);
      container.addChild(character);

      layersRef.current = { base, character, glowTopLeft, glowTopRight, container };

      console.log('Successfully loaded custom card images!');

    } catch (error) {
      console.log('Could not load custom images, keeping placeholders');
    }
  };

  const handleMouseMove = (event, cardContainer) => {
    const mousePos = event.data.global;
    const cardBounds = {
      x: cardContainer.x - 100,
      y: cardContainer.y - 140,
      width: 200,
      height: 280
    };

    const isOver = (
      mousePos.x >= cardBounds.x &&
      mousePos.x <= cardBounds.x + cardBounds.width &&
      mousePos.y >= cardBounds.y &&
      mousePos.y <= cardBounds.y + cardBounds.height
    );

    if (isOver) {
      const centerX = cardBounds.x + cardBounds.width / 2;
      const centerY = cardBounds.y + cardBounds.height / 2;
      const relativeX = (mousePos.x - centerX) / (cardBounds.width / 2);
      const relativeY = (mousePos.y - centerY) / (cardBounds.height / 2);
      applyEffect(relativeX, relativeY);
    } else {
      applyEffect(0, 0);
    }
  };

  const applyEffect = (x, y) => {
    const { base, character, glowTopLeft, glowTopRight } = layersRef.current;
    if (!base || !character) return;

    const maxRotX = 0.2;
    const maxRotY = 0.15;
    const rotY = x * maxRotY;
    const rotX = -y * maxRotX;

    // Base layer 
    base.skew.set(rotY * 0.3, rotX * 0.3);
    base.scale.set(0.5 + Math.abs(x + y) * 0.02);

    // Character layer
    character.skew.set(rotY * 0.35, rotX * 0.35);
    character.scale.set(0.5 + Math.abs(x + y) * 0.025);
    character.x = x * 1.5;
    character.y = -40 + y * 1.5;

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
  };

  return (
    <div>
      <h2>And my own art.</h2>
      <div ref={containerRef} style={{ border: '1px solid #ccc', margin: '20px 0' }} />
    </div>
  );
};

export default ParallaxCard;