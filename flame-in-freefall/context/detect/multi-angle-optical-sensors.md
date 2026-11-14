---
id: multi-angle-and-multi-gas-detection
title: Multi-angle optical sensing and multi-gas monitoring
category: detect
experiments: []
related_experiments: [saffire]
status: draft
reviewed_on: 2026-11-14
evidence_scope: General sensing principles and documented research instruments; vehicle installation claims unverified
---

# Multi-angle optical sensing and multi-gas monitoring

## Summary
These are two different measurement approaches. Multi-angle optical sensing compares light scattered by aerosol particles in different directions. Multi-gas monitoring measures selected gaseous compounds. They can supply complementary information, but a demonstration of either technology does not establish that a particular spacecraft uses it operationally.

## Definitions
- **Aerosol:** particles or droplets suspended in gas; distinct from individual gas molecules.
- **Scattering angle:** angle between the incoming beam direction and the outgoing scattered light. Forward scattering is below 90°; backward scattering is above 90°.
- **Signal ratio:** one measured signal divided by another, usually after calibration and background correction. It is not the number of sensors that have triggered.
- **Refractive index:** a material property affecting how light propagates through and interacts with it.
- **Absorption spectroscopy:** identification or measurement of substances through the wavelengths of light they absorb.
- **Tunable diode laser absorption spectroscopy (TDLAS):** scanning a semiconductor laser over selected molecular absorption features and measuring the resulting loss of transmitted light.
- **Detection limit:** the smallest signal or concentration distinguishable from background under stated measurement conditions.
- **Smouldering:** flameless combustion of a solid; not synonymous with pyrolysis, which is thermal decomposition.
- **ECLSS:** Environmental Control and Life Support System, the systems supporting a habitable spacecraft environment.
- **IMV:** inter-module ventilation, movement of air between connected modules; the acronym alone does not establish any specific vehicle's duct or alarm configuration.

## Multi-angle optical sensing: conceptual explanation
Multiple photodetectors observe a particle sample at different scattering angles. Comparing their measured intensities can help characterise the aerosol when interpreted with an appropriate scattering model and calibration.

There is no universal conversion from a forward/backward signal ratio to “average particle size”. Wavelength, particle composition, shape and the size distribution affect the interpretation. Do not assume that small particles preferentially scatter backwards or that all large particles are smoke. Additional channels may aid discrimination; they do not guarantee elimination of false alarms.

This section is explanatory background, not a sourced specification of an Orion or Gateway instrument. No particular sensor angles, sizing algorithm or performance figures are established here.

## Multi-gas monitoring: documented research
A NASA/JPL record describes a six-channel Combustion Product Monitor (CPM), developed for Saffire, using tunable laser absorption to measure CO, HCl, HCN, HF, CO₂ and O₂. Its stated applications include combustion-event monitoring and post-fire cleanup assessment. Oxygen is monitored as an environmental constituent, not because it is itself a combustion product. [S1]

A separate instrument paper describes five-channel calibration and testing for CO, HCl, HCN, HF and CO₂. These are instrument-development findings, not evidence that every operational spacecraft carries this monitor. [S2]

## Gas names and what they mean
| Formula | Name | Interpretation |
| --- | --- | --- |
| CO | Carbon monoxide | A target combustion-related toxic gas; concentration alone does not locate its source. |
| HCN | Hydrogen cyanide | A monitored toxic gas. Use uppercase HCN, not “HCn”. |
| HCl | Hydrogen chloride | An acid gas targeted by the cited monitors. |
| HF | Hydrogen fluoride | An acid gas targeted by the cited monitors. |
| CO₂ | Carbon dioxide | Also produced by normal respiration; its presence alone does not establish fire. |
| O₂ | Oxygen | An atmospheric constituent important to combustion conditions. |

Do not infer which gases a particular material emits from this target list. Such attribution requires material-specific evidence. In particular, the original statement linking Teflon directly with HCN was not established by the supplied research.

## How absorption measurements are interpreted
A detector measures light transmitted through a gas sample near a selected absorption feature. Concentration estimation needs a calibrated relationship that accounts for optical path length, temperature, pressure and possible interference from other absorbing species. Different target gases require suitable spectral channels. “Absorbs infrared” does not mean a gas is automatically easy to detect at any concentration. [S2]

## Orion and Gateway: evidence boundaries
A 2009 Orion detector paper describes adapting commercial-aircraft smoke-detector technology for spaceflight. Its abstract does not establish the multi-angle geometry described in the original note. [S3]

NASA's 2021 fire-safety roadmap lists Orion and Gateway detector development, but a roadmap does not demonstrate installed or operational hardware. [S4]

The following original claims remain **unverified and must not be presented as facts**:
- Orion and Gateway both use the specific multi-angle and multi-gas arrangement described here.
- Every pressurised Gateway module has the stated duct-mounted detector configuration.
- Docking and IMV automatically provide shared early smoke detection between Orion and Gateway.

These claims need dated, vehicle-specific design or operations sources. Lack of verification here does not prove the claims false.

## Dashboard interpretation
Use this note to explain the distinction between particles and gases. Do not generate gas concentrations, detector efficiencies, alarm thresholds or clearance-to-enter decisions from the conceptual description. Any simulated outputs must be labelled separately from measured research results.

## Sources
- **S1:** Briggs et al. (2019), *The Combustion Product Monitor instrument for the spacecraft fire safety demonstration project*, NTRS abstract; record marked as a preprint. https://ntrs.nasa.gov/citations/20210012108
- **S2:** *Qualification of a Multi-Channel Infrared Laser Absorption Spectrometer for Monitoring CO, HCl, HCN, HF, and CO₂ Aboard Manned Spacecraft*, NTRS abstract. https://ntrs.nasa.gov/citations/20170008204
- **S3:** Sutin et al. (2009), *Smoke Detection for the Orion Crew Exploration Vehicle*, abstract, DOI 10.4271/2009-01-2542. https://saemobilus.sae.org/papers/smoke-detection-orion-crew-exploration-vehicle-2009-01-2542
- **S4:** NASA (2021), *Development of Spacecraft Fire Safety*, slide 10, draft technology roadmap; notional mission information. https://ntrs.nasa.gov/api/citations/20210021318/downloads/Tech%20Dev%20for%20Spacecraft%20Fire%20Safety_Location_10-7-2021.pdf

## Review status
General definitions added; deployment claims separated from supported research. Team review and an instrument-specific source for the multi-angle optical section are still required.

## Diagram geometry and spectral context
The dashboard illustrates a forward sensor at **30° (acute)** and a backward sensor at **150° (obtuse)**, both measured from the incoming beam's forward direction at the scattering point. These are illustrative angles, not measured or verified instrument specifications. Sensor wavelength also affects scattering and calibration.

Infrared absorption channels target selected molecular absorption features. Frequency and vacuum wavelength are related by **f = c / λ**, with f in hertz, λ in metres and c = 299,792,458 m/s. Longer wavelengths correspond to lower frequencies. Different target gases need suitable spectral channels; there is no universal gas-detection frequency. No numerical operating frequency is established here.
