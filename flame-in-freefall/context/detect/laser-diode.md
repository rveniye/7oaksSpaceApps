---
id: laser-diode-smoke-detector
title: Laser-diode forward-scattering smoke detectors
category: detect
experiments: []
related_experiments: [same]
status: draft
reviewed_on: 2026-11-14
evidence_scope: Documented US ISS detector principle; not a current inventory of every ISS module
---

# Laser-diode forward-scattering smoke detectors

## Summary
NASA describes the US ISS smoke-detector design as a near-infrared, laser-diode forward-scattering system. It measures light scattered by airborne particles rather than the ion current used in the Shuttle detector. Detector response depends on the smoke properties, so no single particle detector should be assumed equally sensitive to every overheating material. [S1, S2]

## Definitions
- **Laser diode:** a semiconductor device that produces laser light.
- **Near-infrared (near-IR):** electromagnetic radiation just beyond visible red light.
- **Scattering:** redirection of light by particles. This is the relevant description of the detector's measurement.
- **Refraction:** a change in light's direction associated with a change in refractive index. It is not an adequate substitute for “scattering” in describing the measured smoke signal.
- **Forward scattering:** scattered light travelling at an angle less than 90° from the original beam direction; 0° denotes the original direction.
- **Photosensor / photodetector:** a component that converts received light into an electrical signal.
- **Particle-size distribution:** the range of particle sizes and their relative abundance, rather than one size shared by every particle.
- **Calibration:** establishing how an instrument signal relates to a known reference aerosol or quantity under specified conditions.

## How optical smoke detection works
A light source illuminates a sampling region. Particles redirect some light towards a photodetector positioned away from the direct beam. Electronics evaluate the resulting signal against calibrated alarm criteria. The presence of a single particle does not necessarily trigger an alarm. [S1]

This mechanism does not require an ionising radioactive source. An optical smoke detector detects particles illuminated by its own source; it is different from a flame detector that observes radiation emitted by a flame.

## Why airflow and placement matter
In microgravity, smoke is not carried towards a ceiling by ordinary buoyant rise. Ventilation therefore strongly influences transport to a detector. NASA's fire-protection brief discusses equipment bays, cabins and ventilation-return ducts as relevant locations. Placement in an airflow path does not guarantee detection before smoke reaches the cabin. [S3]

## Experimental evidence and limitations
SAME exposed detectors to smoke generated from several spacecraft-relevant materials. The NIST/NASA account reports that larger smoke particles from cellulose, silicone and Pyrell were readily detected by the ISS photoelectric detector. This is a finding for the tested materials and conditions, not a universal sensitivity specification. [S2]

- Scattering depends on particle size, composition, shape and concentration as well as the optical arrangement.
- Dust and other non-fire aerosols can also scatter light.
- Detector sensitivity and transport delay are separate: even a sensitive detector cannot respond to smoke that has not reached it.
- This note supplies no validated signal-to-concentration conversion, alarm threshold or detection time.
- Avoid saying that all ISS segments use identical hardware, or presenting historical publications as a verified current inventory.

## Sources
- **S1:** Urban et al. (2003), *“Smoke”: Characterization of Smoke Particulate for Spacecraft Fire Detection*, abstract and detector comparison. https://ntrs.nasa.gov/citations/20040053578
- **S2:** NIST (2018), *NIST/NASA Study Shows One Detector Doesn’t ‘Fit All’ for Smoke in Spacecraft*, SAME methods and detector-response discussion. https://www.nist.gov/news-events/news/2018/05/nistnasa-study-shows-one-detector-doesnt-fit-all-smoke-spacecraft
- **S3:** NASA OCHMO (2023), *Fire Protection*, technical brief, slide 8, “Fire Detection”. This brief is explanatory guidance, not a replacement for applicable requirements. https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf

## Review status
Definitions and scope expanded; “refraction” corrected to “scattering”. Team review is still required.

## Frequency and wavelength context
Near-infrared radiation is invisible electromagnetic radiation with longer wavelengths and lower frequencies than visible red light. Frequency and vacuum wavelength obey **f = c / λ**, where f is measured in hertz, λ in metres and c = 299,792,458 m/s. This relationship does not establish the detector's operating wavelength; no exact instrument frequency is specified in this summary. Diagram colours make the invisible beam visible for explanation.
