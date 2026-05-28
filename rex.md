---
file: rex.riv
artboards:
  - name: MAIN
    size: [400, 850]
    origin: [0, 0]
    stateMachines: [REX]
  - name: Onboarding Hand
    size: [91, 105]
    origin: [0, 0]
    stateMachines: [obHandSM]
  - name: streakParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: starParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Card
    size: [244, 334]
    origin: [0, 0]
    stateMachines: [CardSM]
  - name: RadialStreaks
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Onboarding Text
    size: [302, 69]
    origin: [0.5, 0.5]
    stateMachines: [obTextSM]
  - name: cardFront
    size: [250, 334]
    origin: [0, 0]
    stateMachines: [CardFrontSM]
  - name: Pack
    size: [300, 500]
    origin: [0.5, 0.5]
    stateMachines: [PackSM]
  - name: Rip Top 2
    size: [2100, 360]
    origin: [0.5, 0.5]
  - name: Rip Top 2_nested_sequence_0
    size: [2100, 360]
    origin: [0, 0]
  - name: LoadingLoop
    size: [294, 191]
    origin: [0.5, 0.5]
  - name: Button
    size: [300, 63]
    origin: [0, 0]
    stateMachines: [btnSM]
  - name: dotParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Burst
    size: [310, 346]
    origin: [0.5, 0.5]
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
      - { name: obHandLeft, type: viewModel }
      - { name: obTextCarousel, type: viewModel }
      - { name: obTextRip, type: viewModel }
      - { name: obTextCover, type: viewModel }
      - { name: onboardingActive, type: boolean }
      - { name: isMobile, type: boolean }
      - { name: isNativeMobile, type: boolean }
      - { name: section, type: enum, enum: Section }
      - { name: finished, type: boolean }
      - { name: cardReveal, type: trigger }
      - { name: viewInCollection, type: trigger }
      - { name: nextPack, type: trigger }
      - { name: skip, type: trigger }
      - { name: uiVisible, type: boolean }
      - { name: canvasH, type: number }
      - { name: canvasW, type: number }
      - { name: packGraphics, type: image }
      - { name: cardImage, type: image }
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
  images: [imgSeq_50.png, imgSeq_25.png, PackMockup_Lighting.png, PackMockup_Blank.png, PackGraphics_goldGreen.png, imgSeq_39.png, imgSeq_0.png, imgSeq_14.png, imgSeq_28.png, imgSeq_53.png, imgSeq_42.png, imgSeq_3.png, imgSeq_17.png, imgSeq_31.png, imgSeq_6.png, imgSeq_45.png, imgSeq_20.png, imgSeq_34.png, imgSeq_9.png, imgSeq_48.png, imgSeq_23.png, imgSeq_37.png, imgSeq_12.png, imgSeq_26.png, imgSeq_51.png, imgSeq_40.png, imgSeq_1.png, imgSeq_15.png, imgSeq_29.png, imgSeq_54.png, imgSeq_4.png, imgSeq_43.png, imgSeq_18.png, imgSeq_32.png, imgSeq_7.png, Charizard.png, imgSeq_46.png, imgSeq_21.png, imgSeq_35.png, cardFront.png, imgSeq_10.png, imgSeq_49.png, imgSeq_24.png, imgSeq_38.png, imgSeq_13.png, imgSeq_27.png, imgSeq_52.png, imgSeq_41.png, imgSeq_2.png, imgSeq_16.png, imgSeq_30.png, imgSeq_55.png, imgSeq_5.png, imgSeq_44.png, imgSeq_19.png, imgSeq_33.png, imgSeq_8.png, imgSeq_47.png, imgSeq_22.png, imgSeq_36.png, imgSeq_11.png, charizard.png]
  fonts: [Roboto Flex.ttf, Roboto.ttf]
  audio: [skip3 clip.wav, packOpen12.wav, packOpen.wav, heartbeat.wav, packSelect5.wav, carouselFormation.wav, legendary1.wav, rare.wav, grail1.wav, cardReveal0.wav, coverCardOutImpact.wav, idleBGloop0.wav, rippingloop2.wav, swipe2.wav, legendary3 clip.wav, common2.wav, uncommon.wav, skip3.wav, music3.wav, swipe1.wav]
---

## Comments
