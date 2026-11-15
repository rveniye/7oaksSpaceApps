---
id: physics-of-combustion
title: "Physics of combustion"
category: understand
experiments: []
related_experiments: []
status: draft
reviewed_on: null
evidence_scope: Qualitative research summary; no numerical simulation data
---

# Arrhenius equation
Describes how temperature influences the rate constant of a chemical reaction:


$k = A e^{-\frac{E_a}{RT}}$

where:

$k$ = reaction rate constant

$A$ = pre-exponential factor

$E_a$ = Activation energy (J mol $^{-1}$)

$R$ = Gas constant (8.314 J mol $^{-1}$ K $^{-1}$)

# Physics of combustion
Free radicals (an atom or molecule containing an unpaired electron) can make combustion extremely dangerous. They can react to create more radicals, a process called chain branching. The balance between radical production and radical removal influences whether combustion can sustain itself: essentially a never ending chain until a limit of radicals is reached.

A fire detection system could potentially identify chemical intermediates associated with oxidation, rather than relying exclusively on visible light or smoke. A potential system could identify chemical intermediates released and associated with combustion, rather than relying on visible light or smoke.

Pyrolysis (Thermal Decomposition): When solid materials like wood, paper, plastics, or textiles are exposed to high heat (without catching fire), thermal energy breaks down their chemical bonds which releases flammable gases and organic vapours (such as methane, hydrocarbons, or tars) from the surface. This leads to a chain reaction of decomposition which could create further fire hazards. It has no requirement of oxygen, so can happen before the fire actually catches: a material can begin producing combustible gases before it actually catches fire. If an electrical fault or another heat source causes a material to overheat, thermal decomposition can release gases before a developed flame exists. Instead of waiting for smoke, a detection system could investigate unusual volatile organic compounds (VOCs) associated with material degradation. However, normal spacecraft activities can also release VOCs, so the system would need to recognise abnormal combinations rather than treat every VOC measurement as evidence of fire.

# Thermal decomposition is not the same for every material.
Different polymers have different chemical structures and therefore, they produce different decomposition products. This should be taken into account when designing the system. 

Thermal runaway occurs when a process generates heat faster than the system can remove it, causing temperature to rise and potentially accelerate further heat generation, creating a positive feedback loop.  

Rate of heat accumulation = Rate of heat generation - Rate of heat loss

A fire detection system could monitor not just temperature, but the rate at which temperature is changing.

| Stage | Process | Description |
| ------ | ------ | ---------- |
| 1 | Heating | Material absorbs thermal energy |
| 2 | Thermal decomposition | Chemical structures begin breaking down |
| 3 | Pyrolysis | Volatile decomposition products are released |
| 4 | Oxidation | Fuel products react with oxygen |
| 5 | Radical chain reactions | Reactive intermediates participate in combustion |
| 6 | Ignition | Sustained combustion develops |

# Flames surviving at lower oxygen levels
Limiting oxygen index for certain droplet flames was significantly lower in reduced gravity than in normal gravity. 

Flex tests:

__limiting oxygen index in microgravity__
Methanol droplets: 12%
n-Heptane droplets: 15%

This shows microgravity threshold was below the oxygen concentration necessary to sustain biological activity 

However, though they survive, they are significantly less dangerous, a result of their lower temperature. 

You might expect this means microgravity reduces the risk associated with fire. However, oxygen isn’t the only factor in the equation. This is how combustion actually works.

1. Heat from the flame reaches the liquid.

2. The liquid evaporates, releasing fuel vapour. 

3. Fuel vapour moves outwards from the droplet. 

4. Oxygen moves towards the flame from the surrounding atmosphere. 

5. The fuel and oxygen react in a region surrounding the droplet. 

# Two types of self-extinguishing 

1. Diffusive extinguishing 

    Essentially just lack of oxygen. However, not very likely as diffusion works without gravity 

2. Radiative extinction 

    A flame emits thermal radiation, transferring energy away from the reaction zone. Eventually, heat losses exceed the energy being generated. 


# What does this have to do with anything?

As oxygen concentration decreased: 

- The droplet diameter associated with diffusive extinction increased. 

- The droplet diameter associated with radiative extinction decreased. 

Their intersection showed the LOI. 

So why do flames in microgravity survive at low oxygen levels? 

- Reduced buoyancy changes balance between heat generation and heat loss 

- Diffusion becomes more important 

- And fuel chemistry changes 
