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
  - name: bubbleParticle
    size: [0, 0]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Loading
    size: [400, 800]
    origin: [0, 0]
    stateMachines: [State Machine 1]
  - name: Burst
    size: [310, 346]
    origin: [0.5, 0.5]
viewModels:
  - name: RipVM
    properties:
      - { name: burst, type: trigger }
      - { name: burstActive, type: boolean }
      - { name: aligned, type: boolean }
      - { name: ripped, type: trigger }
      - { name: isPressed, type: boolean }
      - { name: isTracking, type: boolean }
      - { name: prog, type: number }
    instances: [Instance]
  - name: MainVM
    properties:
      - { name: loadComplete, type: trigger }
      - { name: radialStreakColor, type: color }
      - { name: packGraphics, type: image }
      - { name: cardImage, type: image }
      - { name: shuffleLeft, type: trigger }
      - { name: shuffleRight, type: trigger }
      - { name: readyToRip, type: boolean }
      - { name: packSelected, type: trigger }
      - { name: openPack, type: viewModel }
      - { name: swap, type: trigger }
      - { name: pack3, type: viewModel }
      - { name: pack1, type: viewModel }
      - { name: pack2, type: viewModel }
      - { name: pack4, type: viewModel }
      - { name: pack5, type: viewModel }
      - { name: btnSkip, type: viewModel }
      - { name: skip, type: trigger }
      - { name: btnViewInCollection, type: viewModel }
      - { name: propertyOfBackgroundVM, type: viewModel }
      - { name: propertyOfRipVM, type: viewModel }
    instances: [Instance]
  - name: RadialStreaks
    properties:
      - { name: radialStreaksActive, type: boolean }
      - { name: radialStreaksFast, type: boolean }
      - { name: radialStreakColor, type: color }
    instances: [Instance]
  - name: BtnVM
    properties:
      - { name: btnText, type: string }
      - { name: isClicked, type: trigger }
      - { name: isHovered, type: boolean }
    instances: [skip, viewInCollection]
  - name: BackgroundVM
    properties:
      - { name: propertyOfRadialStreaks, type: viewModel }
      - { name: radialStreakColor, type: color }
      - { name: streaksFast, type: boolean }
      - { name: starsActive, type: boolean }
      - { name: dotsActive, type: boolean }
      - { name: streaksActive, type: boolean }
    instances: [Instance]
  - name: PackVM
    properties:
      - { name: propertyOfRipVM, type: viewModel }
      - { name: open, type: boolean }
      - { name: shake, type: trigger }
      - { name: isHero, type: boolean }
      - { name: isHovered, type: boolean }
      - { name: packEdgeGlow, type: boolean }
    instances: [pack3, openPack, pack1, pack2, pack4, pack5]
assets:
  images: [imgSeq_18.png, imgSeq_50.png, imgSeq_25.png, PackMockup_Lighting.png, PackMockup_Blank.png, PackGraphics_goldGreen.png, imgSeq_32.png, imgSeq_39.png, imgSeq_0.png, imgSeq_7.png, imgSeq_14.png, imgSeq_46.png, imgSeq_21.png, imgSeq_28.png, imgSeq_53.png, imgSeq_35.png, imgSeq_42.png, imgSeq_3.png, imgSeq_10.png, imgSeq_17.png, imgSeq_49.png, imgSeq_24.png, imgSeq_31.png, imgSeq_38.png, cardFront.png, imgSeq_6.png, imgSeq_13.png, imgSeq_45.png, imgSeq_20.png, imgSeq_27.png, imgSeq_52.png, imgSeq_34.png, imgSeq_41.png, imgSeq_2.png, imgSeq_9.png, imgSeq_16.png, imgSeq_48.png, imgSeq_23.png, imgSeq_30.png, imgSeq_55.png, imgSeq_37.png, imgSeq_5.png, imgSeq_44.png, imgSeq_12.png, imgSeq_19.png, imgSeq_26.png, imgSeq_51.png, imgSeq_33.png, imgSeq_40.png, charizard.png, imgSeq_1.png, imgSeq_8.png, imgSeq_15.png, imgSeq_47.png, imgSeq_22.png, imgSeq_29.png, imgSeq_54.png, imgSeq_36.png, imgSeq_4.png, imgSeq_43.png, imgSeq_11.png]
  fonts: [Roboto.ttf]
  audio: [small_whoosh_fast_12 clip.wav, "AMBFant_Magical Place, High Bell Notes, High Tone, Low Wind, Loopable_Ocular Sounds_Fantasy Ambiences_The Complete Fantasy Collection_01.wav", UIMvmt_TRANSITION-Tonal Selection and Slide_Ocular_Vector.wav, small_whoosh_fast_10 clip.wav, dig_whoosh_08 clip.wav, "DSGNDron_Heartbeat Drone, Loop, Key Dmin_Ocular Sounds_Eerie Drones_The Complete Drones Collection_01.wav", Swipe Transition clip.wav, Heartbeat Vr1_01.wav]
---

## Comments
