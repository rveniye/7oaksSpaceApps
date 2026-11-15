// Generated from data/source-provenance.json; run npm run sync:sources.
globalThis.SourceProvenance = {
  "version": 1,
  "checkedOn": "2026-11-14",
  "method": "Primary-source content inspected and compared where stated. PSI identities, versions and DOIs checked in the rendered repository pages. Scope is per record; a source check does not validate every claim or every member of a grouped family.",
  "records": {
    "bass": {
      "id": "EVID-BASS",
      "pages": [
        "prevent",
        "understand"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "BASS-II studies solid-fuel burning in MSG; oxygen, airflow and sample geometry are test variables. The report identifies imaging and gas measurements.",
      "limits": "BASS-II record only; BASS-I runs are not individually checked. No numerical run files or calibration have been imported.",
      "sources": [
        {
          "title": "BASS-II · PSI-25 v4",
          "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25",
          "kind": "Repository metadata",
          "locator": "Record heading, DOI, Objectives and Approach",
          "recordId": "PSI-25",
          "version": 4,
          "doi": "10.60555/4qc4-de67"
        },
        {
          "title": "BASS-II Summary Report",
          "url": "https://ntrs.nasa.gov/citations/20210011385",
          "kind": "Technical memorandum",
          "locator": "Abstract: apparatus, variables and measurement instruments"
        },
        {
          "title": "BASS-II preliminary results",
          "url": "https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20160000593.pdf",
          "kind": "Conference abstract",
          "locator": "Wind-tunnel capability description"
        }
      ],
      "issues": [
        "PSI describes a wind-tunnel maximum of 40 cm/s; the earlier results abstract says 53 cm/s. These are not treated as a verified common run range. Check the individual run documentation before importing speeds."
      ]
    },
    "saffire": {
      "id": "EVID-SAFFIRE",
      "pages": [
        "prevent",
        "understand"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "Saffire I–III investigate large-scale material flame spread and flammability. Saffire-I was conducted in Cygnus after departure from ISS.",
      "limits": "Direct repository link covers Saffire-I, not the full I–III family. Measurements and sample dimensions have not been imported.",
      "sources": [
        {
          "title": "Saffire-I · PSI-98 v4",
          "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-98",
          "kind": "Repository metadata",
          "locator": "Record heading, DOI, Objectives and Approach",
          "recordId": "PSI-98",
          "version": 4,
          "doi": "10.60555/0t15-1z43"
        },
        {
          "title": "Operation and Development Status of Saffire",
          "url": "https://ntrs.nasa.gov/api/citations/20170000230/downloads/20170000230.pdf",
          "kind": "Research paper",
          "locator": "Abstract and Saffire-I apparatus discussion"
        },
        {
          "title": "NASA Saffire-I flight report",
          "url": "https://www.nasa.gov/news-release/nasa-glenn-successfully-ignites-largest-fire-experiment-in-space/",
          "kind": "Agency mission report",
          "locator": "15 June 2016: completed experiment aboard departed Cygnus"
        }
      ],
      "issues": [
        "PSI-98 lists project dates in 2001–2008 and an ISS platform, while its Approach and the 2016 flight report describe Cygnus. Repository dates/platform are not imported as experiment dates or location."
      ]
    },
    "same": {
      "id": "EVID-SAME",
      "pages": [
        "detect"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "SAME examined material-dependent smoke and detector response. SAME-R is a reflight with changed materials, conditions and instrumentation.",
      "limits": "The repository record is SAME-R; the publication covers spacecraft detector testing. Do not merge the two test matrices. No response curves or detector specifications are imported.",
      "sources": [
        {
          "title": "SAME-R · PSI-101 v4",
          "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-101",
          "kind": "Repository metadata",
          "locator": "Record heading, DOI, Objectives and Approach",
          "recordId": "PSI-101",
          "version": 4,
          "doi": "10.60555/2np7-jv14"
        },
        {
          "title": "Evaluation of spacecraft smoke detector performance",
          "url": "https://www.nist.gov/publications/evaluation-spacecraft-smoke-detector-performance-low-gravity-environment",
          "kind": "Publication abstract",
          "locator": "Abstract: controlled conditions, instruments and detection limitations"
        },
        {
          "title": "NIST/NASA explanation of SAME results",
          "url": "https://www.nist.gov/news-events/news/2018/05/nistnasa-study-shows-one-detector-doesnt-fit-all-smoke-spacecraft",
          "kind": "Agency research account",
          "locator": "Methods and material-dependent detector response"
        }
      ],
      "issues": []
    },
    "flex": {
      "id": "EVID-FLEX",
      "pages": [
        "suppress",
        "understand",
        "applications"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "FLEX studies droplet combustion limits and gaseous suppression. The repository and operations overview agree on the extinction and limiting-oxygen objectives.",
      "limits": "Direct record is FLEX, not FLEX-2. No raw extinction measurements or complete run matrix is loaded. The Understand physics section separately cites published LOI summary values.",
      "sources": [
        {
          "title": "FLEX · PSI-69 v5",
          "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-69",
          "kind": "Repository metadata",
          "locator": "Record heading, DOI, Objectives and Approach",
          "recordId": "PSI-69",
          "version": 5,
          "doi": "10.60555/mbq8-0451"
        },
        {
          "title": "NASA Glenn FLEX operations overview",
          "url": "https://gipoc.grc.nasa.gov/wp/fcf-cir/flex/",
          "kind": "Agency experiment overview",
          "locator": "FLEX Overview and MDCA navigation"
        }
      ],
      "issues": []
    },
    "cfi": {
      "id": "EVID-CFI",
      "pages": [
        "understand",
        "applications"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "CFI concerns cool-flame chemistry; NASA operations groups it under MDCA. NASA connects the later gas experiment to the earlier FLEX droplet observations.",
      "limits": "No CFI dataset identifier, temperatures or species measurements imported. CFI and CFI-G remain separate.",
      "sources": [
        {
          "title": "NASA Glenn CFI overview",
          "url": "https://gipoc.grc.nasa.gov/wp/fcf-cir/mdca/cfi/",
          "kind": "Agency experiment overview",
          "locator": "CFI Overview and MDCA navigation"
        },
        {
          "title": "Cool flames created on ISS",
          "url": "https://www.nasa.gov/missions/station/cool-flames-created-during-a-first-for-international-space-station-research/",
          "kind": "Agency research account",
          "locator": "FLEX discovery and subsequent gaseous-fuel work"
        }
      ],
      "issues": []
    },
    "bre": {
      "id": "EVID-BRE",
      "pages": [
        "understand",
        "prevent"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "BRE addresses material flammability and test-method relevance; NASA describes its gaseous-fuel approach.",
      "limits": "Overview claims only. No raw run data, apparatus settings or performance guarantees imported.",
      "sources": [
        {
          "title": "NASA Glenn Burning Rate Emulator",
          "url": "https://gipoc.grc.nasa.gov/wp/fcf-cir/acme/burning-rate-emulator-bre-operations/",
          "kind": "Agency experiment overview",
          "locator": "Experiment Overview"
        },
        {
          "title": "NASA ACME experiment account",
          "url": "https://science.nasa.gov/science-research/biological-physical-sciences/a-thousand-points-of-light-on-the-international-space-station/",
          "kind": "Agency research account",
          "locator": "Burning Rate Emulator paragraph"
        }
      ],
      "issues": []
    },
    "efield": {
      "id": "EVID-EFIELD",
      "pages": [
        "understand",
        "suppress"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "Electric fields act on flame ions and induced gas motion; the research concerns control of non-premixed flames.",
      "limits": "Overview claims only. No raw run data, apparatus settings or performance guarantees imported.",
      "sources": [
        {
          "title": "NASA Glenn E-FIELD Flames",
          "url": "https://gipoc.grc.nasa.gov/wp/fcf-cir/acme/electric-field-effects-laminar-diffusion-flames-e-field-flames/",
          "kind": "Agency experiment overview",
          "locator": "Experiment Overview"
        },
        {
          "title": "NASA ACME experiment account",
          "url": "https://science.nasa.gov/science-research/biological-physical-sciences/a-thousand-points-of-light-on-the-international-space-station/",
          "kind": "Agency research account",
          "locator": "E-FIELD Flames paragraph"
        }
      ],
      "issues": []
    },
    "flamedesign": {
      "id": "EVID-FLAMEDESIGN",
      "pages": [
        "understand",
        "applications"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "Flame Design studies soot inception and control in oxygen-enriched non-premixed combustion.",
      "limits": "Overview claims only. No raw run data, apparatus settings or performance guarantees imported.",
      "sources": [
        {
          "title": "NASA Glenn Flame Design",
          "url": "https://gipoc.grc.nasa.gov/wp/fcf-cir/acme/flame-design/",
          "kind": "Agency experiment overview",
          "locator": "Experiment Overview"
        },
        {
          "title": "NASA ACME experiment account",
          "url": "https://science.nasa.gov/science-research/biological-physical-sciences/a-thousand-points-of-light-on-the-international-space-station/",
          "kind": "Agency research account",
          "locator": "Flame Design paragraph"
        }
      ],
      "issues": []
    },
    "cfig": {
      "id": "EVID-CFIG",
      "pages": [
        "understand"
      ],
      "checkedOn": "2026-11-14",
      "status": "Partial check",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "NASA identifies CFI-G as the gaseous-fuel cool-flame investigation; it is separate from droplet CFI.",
      "limits": "The 85% oxygen figure and detailed inverse-burner configuration from the challenge brief were not independently checked in this audit. They are not imported as verified conditions.",
      "sources": [
        {
          "title": "NASA ACME experiment account",
          "url": "https://science.nasa.gov/science-research/biological-physical-sciences/a-thousand-points-of-light-on-the-international-space-station/",
          "kind": "Agency research account",
          "locator": "Sixth experiment: CFIG"
        },
        {
          "title": "Cool flames created on ISS",
          "url": "https://www.nasa.gov/missions/station/cool-flames-created-during-a-first-for-international-space-station-research/",
          "kind": "Agency research account",
          "locator": "Gaseous-fuel cool-flame experiment"
        }
      ],
      "issues": []
    },
    "spice": {
      "id": "EVID-SPICE",
      "pages": [
        "understand",
        "applications"
      ],
      "checkedOn": "2026-11-14",
      "status": "Identity checked only",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "NASA’s PSI index lists SPICE and SLICE as separate combustion investigations.",
      "limits": "This checks investigation identity only. Shared duct hardware, sample conditions and numerical findings still need investigation-specific sources.",
      "sources": [
        {
          "title": "NASA PSI research-area index",
          "url": "https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/",
          "kind": "Repository index",
          "locator": "Combustion Science: SPICE and SLICE"
        }
      ],
      "issues": []
    },
    "daft": {
      "id": "EVID-DAFT",
      "pages": [
        "understand",
        "detect"
      ],
      "checkedOn": "2026-11-14",
      "status": "Partial check",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "NASA’s PSI index lists DAFT and DAFT-2. NASA’s DAFT description links its modified P-Trak instrument to SAME.",
      "limits": "Instrument relationship is described at overview level. DAFT-2-specific settings and smoke/dust calibration are not checked.",
      "sources": [
        {
          "title": "NASA PSI research-area index",
          "url": "https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/",
          "kind": "Repository index",
          "locator": "Combustion Science: DAFT and DAFT-2"
        },
        {
          "title": "NASA DAFT description",
          "url": "https://www.nasa.gov/wp-content/uploads/2025/07/dust-and-aerosol-measurement-feasibility-test-daft.pdf",
          "kind": "Agency experiment summary",
          "locator": "Opening paragraph: modified P-Trak and SAME"
        }
      ],
      "issues": []
    },
    "sofie": {
      "id": "EVID-SOFIE",
      "pages": [
        "prevent",
        "understand",
        "applications"
      ],
      "checkedOn": "2026-11-14",
      "status": "Summary checked",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "SoFIE studies solid-fuel fire behaviour. SoFIE-GEL specifically varies flow, oxygen, pressure and heating for flame growth and extinction studies.",
      "limits": "SoFIE is a facility/programme, not one uniform dataset. SoFIE-GEL conditions do not describe every SoFIE investigation.",
      "sources": [
        {
          "title": "NASA SoFIE mission page",
          "url": "https://science.nasa.gov/mission/sofie/",
          "kind": "Agency programme overview",
          "locator": "Mission description"
        },
        {
          "title": "NASA SoFIE-GEL investigation",
          "url": "https://science.nasa.gov/biological-physical/investigations/sofie-gel/",
          "kind": "Agency investigation overview",
          "locator": "Experiment description: PMMA sphere and varied conditions"
        }
      ],
      "issues": []
    },
    "cpm": {
      "id": "EVID-CPM",
      "pages": [
        "detect"
      ],
      "checkedOn": "2026-11-14",
      "status": "Abstract checked only",
      "origin": "Curated research summary",
      "measurementsImported": false,
      "checkedScope": "The CPM abstract describes tunable laser absorption monitoring of CO, HCl, HCN, HF, CO2 and O2 for Saffire.",
      "limits": "Preprint abstract only; no numerical detection limits or spacecraft deployment claims verified. This is not evidence for the combined detector comparison scores.",
      "sources": [
        {
          "title": "Combustion Product Monitor for Saffire",
          "url": "https://ntrs.nasa.gov/citations/20210012108",
          "kind": "Preprint abstract",
          "locator": "Abstract and Document Type"
        }
      ],
      "issues": []
    },
    "physics": {
      "id": "EVID-PHYSICS",
      "pages": [
        "understand"
      ],
      "checkedOn": "2026-11-15",
      "status": "Published summary and diagram checked",
      "origin": "Published summary values and an educational schematic",
      "measurementsImported": false,
      "checkedScope": "The 2014 FLEX paper reports oxygen/nitrogen LOI values near 0.12 for methanol and 0.15 for heptane. The 2013 methanol paper distinguishes residence-time and radiative extinction. The IIT Kanpur diagram matches the supplied image.",
      "limits": "Reported summary values only, not imported run measurements or universal safety thresholds. The diagram is an idealised flame-sheet model. Source Markdown is preserved; the webpage corrects unsupported safety conclusions and distinguishes pyrolysis from an obligatory six-step sequence.",
      "sources": [
        {
          "title": "Droplet Combustion Experiments Aboard the International Space Station",
          "url": "https://bpb-us-w2.wpmucdn.com/sites.coecis.cornell.edu/dist/9/231/files/2018/09/2014-MST-Droplet-combustion-experiments-aboard-the-2je8ess-12toi72.pdf",
          "kind": "Research paper",
          "locator": "Abstract, pp. 65–66; DOI 10.1007/s12217-014-9372-2"
        },
        {
          "title": "Methanol Droplet Combustion in Oxygen-Inert Environments in Microgravity",
          "url": "https://ntrs.nasa.gov/api/citations/20130014061/downloads/20130014061.pdf",
          "kind": "Research paper",
          "locator": "Abstract and section 3.3: two extinction mechanisms"
        },
        {
          "title": "IIT Kanpur Virtual Labs: Characterization of Droplet Combustion",
          "url": "https://home.iitk.ac.in/~mishra/virtual_lab/documentor/theory8.html",
          "kind": "University teaching material",
          "locator": "Droplet Combustion Processes; image picture66.jpg"
        },
        {
          "title": "Purdue University: Activation Energy",
          "url": "https://chemed.chem.purdue.edu/genchem/topicreview/bp/ch22/activate",
          "kind": "University teaching material",
          "locator": "Arrhenius equation and temperature dependence"
        }
      ],
      "issues": [
        "The original diagram calls r_s a droplet diameter, but draws it from centre to surface. The caption explicitly identifies it as a radius.",
        "The Markdown claim that lower-temperature flames are significantly less dangerous is not presented as an established conclusion."
      ]
    },
    "ventilation": {
      "id": "EVID-VENTILATION",
      "pages": [
        "suppress"
      ],
      "checkedOn": "2026-11-15",
      "status": "Summary checked",
      "origin": "Published experimental reports",
      "measurementsImported": false,
      "checkedScope": "NASA Glenn confined-channel flamelet flare-up checked against text and caption. Saffire V PMMA reduced-flow cooling sequence checked against section III.A, Table 1 and Figures 5–6; cotton persistence checked against Figure 3 discussion.",
      "limits": "Specific channel and spacecraft experiment configurations. No evidence here establishes a quick ventilation open–close pulse as reliable flamelet suppression. Published settings are not cabin operating instructions or raw run data.",
      "sources": [
        {
          "title": "NASA Glenn: Fingering Flamelets Form a Dynamic Population",
          "url": "https://ntrs.nasa.gov/api/citations/20050217475/downloads/20050217475.pdf",
          "kind": "NASA research summary",
          "locator": "Pages 1–2: text and figure caption on increasing airflow"
        },
        {
          "title": "Fire Safety Implications of Preliminary Results from Saffire IV and V",
          "url": "https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf",
          "kind": "Conference paper, ICES-2021-266",
          "locator": "Section III.A, pp. 4–6; Table 1; Figures 3, 5–6"
        }
      ],
      "issues": []
    },
    "flamelets": {
      "id": "EVID-FLAMELETS",
      "pages": [
        "understand"
      ],
      "checkedOn": "2026-11-15",
      "status": "References supplied; content check incomplete",
      "origin": "Research-team supplied references",
      "measurementsImported": false,
      "checkedScope": "Exact URLs supplied by the team were added to the flamelet section. Retrieval attempted using the research browser and a direct HTTP client.",
      "limits": "Original content was inaccessible: ScienceDirect HTTP 403, American Scientist HTTP 503. Article identity and claim-level support were not independently verified. No new measurements or scientific claims extracted.",
      "sources": [
        {
          "title": "ScienceDirect — flamelet research paper",
          "url": "https://www.sciencedirect.com/science/article/abs/pii/S0010218009000157",
          "kind": "Team-supplied reference",
          "locator": "PII S0010218009000157; original content check blocked (HTTP 403)"
        },
        {
          "title": "Fire in Microgravity — American Scientist",
          "url": "https://www.americanscientist.org/article/fire-in-microgravity",
          "kind": "Team-supplied reference",
          "locator": "Supplied article URL; original content check unavailable (HTTP 503)"
        }
      ],
      "issues": [
        "Independent original-source content check remains incomplete."
      ]
    }
  }
};
