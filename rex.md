---
file: rex.riv
artboards:
  - name: MAIN
    size: [400, 850]
    origin: [0, 0]
    stateMachines: [REX]
  - name: LoadingLoop
    size: [294, 191]
    origin: [0.5, 0.5]
  - name: Onboarding Hand
    size: [91, 105]
    origin: [0, 0]
    stateMachines: [obHandSM]
  - name: streakParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: RadialStreaks
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: starParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Button
    size: [300, 63]
    origin: [0, 0]
    stateMachines: [btnSM]
  - name: dotParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Onboarding Text
    size: [302, 69]
    origin: [0.5, 0.5]
    stateMachines: [obTextSM]
  - name: Burst
    size: [310, 346]
    origin: [0.5, 0.5]
  - name: Pack
    size: [300, 500]
    origin: [0.5, 0.5]
    stateMachines: [PackSM]
  - name: riptopSprite
    size: [1023, 216]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: cardFront
    size: [250, 334]
    origin: [0, 0]
    stateMachines: [CardFrontSM]
  - name: bubbleParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Loading
    size: [400, 800]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: streakParticle 2
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
viewModels:
  - name: MainVM
    properties:
      - { name: isDegraded, type: boolean }
      - { name: loadComplete, type: trigger }
      - { name: packCount, type: number }
      - { name: rarity, type: enum, enum: Rarity }
      - { name: packGraphics, type: image }
      - { name: cardImage, type: image }
      - { name: topSpriteImg, type: image }
      - { name: isMobile, type: boolean }
      - { name: isNativeMobile, type: boolean }
      - { name: cardFrontCtrlX, type: number }
      - { name: cardFrontCtrlY, type: number }
      - { name: section, type: enum, enum: Section }
      - { name: finished, type: boolean }
      - { name: cardReveal, type: trigger }
      - { name: viewInCollection, type: trigger }
      - { name: nextPack, type: trigger }
      - { name: skip, type: trigger }
      - { name: uiVisible, type: boolean }
      - { name: onboardingActive, type: boolean }
      - { name: obHandLeft, type: viewModel }
      - { name: obTextCarousel, type: viewModel }
      - { name: obTextRip, type: viewModel }
      - { name: obTextCover, type: viewModel }
      - { name: canvasH, type: number }
      - { name: canvasW, type: number }
      - { name: rarityColor, type: color }
      - { name: rarityColor2, type: color }
      - { name: streakParticleColor, type: color }
      - { name: shuffleLeft, type: trigger }
      - { name: shuffleLeft2, type: trigger }
      - { name: shuffleRight, type: trigger }
      - { name: shuffleRight2, type: trigger }
      - { name: readyToRip, type: boolean }
      - { name: packSelected, type: trigger }
      - { name: openPack, type: viewModel }
      - { name: swap, type: trigger }
      - { name: heroPack, type: viewModel }
      - { name: pack1, type: viewModel }
      - { name: pack2, type: viewModel }
      - { name: pack4, type: viewModel }
      - { name: pack5, type: viewModel }
      - { name: btnNext, type: viewModel }
      - { name: btnSkip, type: viewModel }
      - { name: btnViewInCollection, type: viewModel }
      - { name: propertyOfBackgroundVM, type: viewModel }
      - { name: propertyOfRipVM, type: viewModel }
      - { name: onRightSide, type: boolean }
      - { name: onLeftSide, type: boolean }
    instances: [Instance]
  - name: OnboardingVM
    properties:
      - { name: fadeIn, type: trigger }
      - { name: fadeOut, type: trigger }
      - { name: isSwipping, type: boolean }
      - { name: isPulling, type: boolean }
      - { name: isPointing, type: boolean }
      - { name: textIn, type: trigger }
      - { name: textOut, type: trigger }
      - { name: instruction, type: string }
    instances: [pack select, handPull, handPoint, handSwipe, cover card, pack rip]
  - name: CardVM
    properties:
      - { name: flash, type: trigger }
      - { name: revealed, type: trigger }
      - { name: glare, type: number }
    instances: [Instance]
  - name: RipVM
    properties:
      - { name: readyToDrop, type: boolean }
      - { name: coverDragging, type: boolean }
      - { name: cardDrop, type: trigger }
      - { name: propertyOfCardVM, type: viewModel }
      - { name: cardRevealed, type: boolean }
      - { name: mobileProg, type: number }
      - { name: burst, type: trigger }
      - { name: burstActive, type: boolean }
      - { name: aligned, type: boolean }
      - { name: ripped, type: trigger }
      - { name: isPressed, type: boolean }
      - { name: isTracking, type: boolean }
      - { name: prog, type: number }
    instances: [Instance]
  - name: BackgroundVM
    properties:
      - { name: streaksFast, type: boolean }
      - { name: starsActive, type: boolean }
      - { name: dotsActive, type: boolean }
      - { name: streaksActive, type: boolean }
    instances: [Instance]
  - name: PackVM
    properties:
      - { name: carouselReady, type: boolean }
      - { name: propertyOfRipVM, type: viewModel }
      - { name: open, type: boolean }
      - { name: shake, type: trigger }
      - { name: isHero, type: boolean }
      - { name: isHovered, type: boolean }
      - { name: packEdgeGlow, type: boolean }
    instances: [heroPack, openPack, pack1, pack2, pack4, pack5]
  - name: CardFrontVM
    properties:
      - { name: isDragging, type: boolean }
      - { name: isTracking, type: boolean }
    instances: [Instance]
  - name: RadialStreaks
    properties:
      - { name: opacity, type: number }
      - { name: streakColor1, type: color }
      - { name: streakColor2, type: color }
      - { name: radialStreaksActive, type: boolean }
      - { name: radialStreaksFast, type: boolean }
    instances: [Instance]
  - name: BtnVM
    properties:
      - { name: btnText, type: string }
      - { name: isClicked, type: trigger }
      - { name: isHovered, type: boolean }
    instances: [skip, viewInCollection, next, RadialStreaks Instance, Onboarding Hand Instance, Onboarding Hand Instance]
enums:
  - name: Rarity
    values: [common, uncommon, rare, epic, legendary, grail]
  - name: Section
    values: [loading, carousel, rip, cover, reveal]
assets:
  images: [PackMockup_Lighting.png, PackMockup_Blank.png, PackGraphics_goldGreen.png, Charizard.png, cardFront.png, GreenSprite.png, charizard.png]
  fonts: [Roboto Flex.ttf, Roboto.ttf]
  audio: [skip3 clip.wav, packOpen12.wav, packOpen.wav, cardReveal0.wav, coverCardOutImpact.wav, idleBGloop0.wav, heartbeat.wav, rippingloop2.wav, packSelect5.wav, carouselFormation.wav, swipe2.wav, legendary1.wav, legendary2.wav, common2.wav, rare.wav, uncommon.wav, grail1.wav, skip3.wav, music3.wav, swipe1.wav]
---

## Comments
