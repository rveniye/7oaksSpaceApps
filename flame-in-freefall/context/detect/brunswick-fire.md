---
id: brunswick-fire-detector
title: Brunswick incipient fire detectors
category: detect
experiments: []
related_experiments: [same]
status: draft
reviewed_on: 2026-11-14
evidence_scope: Historical Shuttle hardware; not current fleet configuration
---

# Brunswick incipient fire detectors

## Summary
The Space Shuttle used actively sampled ionisation smoke detectors made by Brunswick. A pump drew air into the instrument, and an aerodynamic separator diverted larger particles away from its sensing chamber. Small particles entering the chamber changed an electrical current, providing an early indication of possible overheating or fire. This is historical hardware, not a statement about a spacecraft operating today. [S1, S2]

## Definitions
- **Incipient fire:** the early development of a potential fire; overheating can release detectable material before a visible flame appears.
- **Pyrolysis:** chemical decomposition caused by heating. It is not synonymous with flaming combustion.
- **Aerosol:** solid particles or liquid droplets suspended in a gas. Smoke is an aerosol; dust can also be an aerosol.
- **Submicrometre:** smaller than one micrometre (µm). One µm is one millionth of a metre. Do not substitute “ultrafine”: that term conventionally refers to particles below approximately 0.1 µm.
- **Ionisation:** the formation of electrically charged atoms or molecules.
- **False alarm:** an alarm triggered without the fire condition the detector is intended to identify.

## How the detector works
1. A pump supplies a controlled air sample.
2. The inlet flow divides into a sensing path and a bypass. Particle inertia and the flow geometry favour entry of smaller particles into the sensing path.
3. Americium-241 produces ionisation inside the chamber. An electric field establishes an ion current.
4. Aerosol particles attach to ions and change charge transport, reducing the current.
5. Electronics evaluate the signal and its change against alarm criteria. [S1]

The separator is aerodynamic; it is not simply a mesh that catches dust. Its size selection cannot chemically identify a particle as smoke or dust. [S1]

## Why microgravity matters
A detector needs contaminated air to reach its inlet. Forced sampling helps draw air through the instrument, but does not guarantee collection from every part of a cabin. The Shuttle detector's small-particle emphasis also meant that its response depended on the smoke population produced by the source. [S2]

## Limitations and interpretation
- Do not describe this detector as admitting large combustion particles while rejecting smaller dust. That reverses the documented separation principle.
- Particle-size discrimination can reduce nuisance responses; it cannot eliminate all false alarms or missed detections.
- A particle signal does not identify the burning material, locate the source or measure toxic-gas concentration.
- No calibration curve, alarm threshold or detection-time model is provided in this note. Do not calculate those values from this description.

## Related experiment
SAME compared spacecraft smoke detectors and characterised smoke from different materials. It was an investigation, not the name of the Brunswick instrument. See the optical-detector note for the comparison source.

## Sources
- **S1:** NASA, *Other Challenges in the Development …*, Space Shuttle Orbiter fire-protection discussion, printed p. 469, “Smoke Detector” and Figure 4 discussion. https://ntrs.nasa.gov/api/citations/19850008615/downloads/19850008615.pdf
- **S2:** Urban et al. (2008), *Spacecraft Fire Detection: Smoke Properties and Transport in Low-Gravity*, section “Space Shuttle Detectors”. https://ntrs.nasa.gov/api/citations/20080012612/downloads/20080012612.pdf

## Review status
Mechanism checked against the sources above. Team review is still required before marking this note approved.
