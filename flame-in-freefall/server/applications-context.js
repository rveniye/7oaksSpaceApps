// This server-side description interprets only the controls visible on the
// Understand and Applications pages. Client-supplied measurements, conclusions and prose never
// enter the model prompt.
export function validateApplicationInputs(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid Applications settings.');
  }
  if (!Number.isInteger(value.stage) || value.stage < 0 || value.stage > 3) {
    throw new Error('Invalid droplet stage.');
  }
  if (typeof value.enhance !== 'boolean') throw new Error('Invalid visibility setting.');
  for (const field of ['formation', 'oxidation']) {
    if (!['low', 'medium', 'high'].includes(value[field])) throw new Error('Invalid soot setting.');
  }
  if (!Number.isInteger(value.engine) || value.engine < 0 || value.engine > 2) {
    throw new Error('Invalid engine stage.');
  }
  return {
    stage: value.stage,
    enhance: value.enhance,
    formation: value.formation,
    oxidation: value.oxidation,
    engine: value.engine
  };

}

const dropletStages = [
  'Before ignition: liquid fuel is present in oxygen-containing air; no self-sustaining flame is shown.',
  'Hot ignition: both selected examples show hot combustion around the liquid fuel droplets.',
  'Visible extinction: the hot flame fades in the selected FLEX-inspired pathway while the left-hand reference remains hot. The dashed outline marks a former hot zone. A dark image cannot establish whether reaction has stopped.',
  'Cool reaction: the right-hand example shows a possible lower-temperature reaction after visible hot-flame extinction. This depends on suitable fuel chemistry and surrounding conditions; it does not follow every extinction.'
];
const engineStages = [
  'Mixed charge: fuel and air are mixed above the piston before ignition.',
  'Compression: the rising piston compresses the mixture. Low-temperature chemistry can affect subsequent ignition.',
  'Distributed ignition: the selected HCCI example shows compressed fuel and air autoigniting without a spark. No ignition timing is calculated.'
];

export function applicationContext(inputs, page) {
  const clean = validateApplicationInputs(inputs);
  const context = {
    inputs: clean,
    droplet: dropletStages[clean.stage],
    visibility: clean.enhance
      ? 'Enhanced view: the cyan outline is an explanatory overlay, not a measured camera image or physical change to the flame.'
      : 'Faint view: the explanatory enhancement is off. Weak visible light does not establish that reaction is absent.',
    soot: `The adjustable example uses ${clean.formation} formation and ${clean.oxidation} oxidation. The fixed comparison uses low formation and high oxidation. Formation creates soot; oxidation chemically consumes it. Animation dots and their counts are authored visual tokens, not measured particles, soot mass, emissions, or a kinetics prediction.`,
    engine: engineStages[clean.engine],
    limitations: [
      'The controls describe separate educational examples, not one linked physical simulation.',
      'No experimental run data, fuel identity, measured temperature, ignition threshold, burn duration or safe condition is supplied.',
      'The selected settings do not support numerical performance or safety conclusions.'
    ]
  };
  if (page === 'understand') { delete context.engine; delete context.inputs.engine; }
  if (page === 'applications') { delete context.droplet; delete context.visibility; delete context.soot; context.inputs = {engine:clean.engine}; }
  return context;
}
