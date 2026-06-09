export function mergeProfessionSiteContent(baseData, content) {
  const sections = content?.sections || {};
  const hero = sections.hero || {};
  const services = sections.services || {};
  const whyUs = sections.whyUs || {};
  const process = sections.process || {};
  const baseProcessSteps = Array.isArray(baseData.process?.steps)
    ? baseData.process.steps
    : [];
  const contentProcessSteps = Array.isArray(process.steps) ? process.steps : null;
  const mergedProcessSteps = contentProcessSteps
    ? [
        ...contentProcessSteps,
        ...baseProcessSteps.slice(contentProcessSteps.length),
      ]
    : baseProcessSteps;

  return {
    ...baseData,
    meta: {
      ...(baseData.meta || {}),
      title: content?.metaTitle || baseData.meta?.title,
      desc: content?.metaDescription || baseData.meta?.desc,
    },
    hero: {
      ...(baseData.hero || {}),
      ...hero,
    },
    services: {
      ...(baseData.services || {}),
      ...services,
      items: Array.isArray(services.items)
        ? services.items
        : baseData.services?.items || [],
    },
    whyUs: {
      ...(baseData.whyUs || {}),
      ...whyUs,
      features: Array.isArray(whyUs.features)
        ? whyUs.features
        : Array.isArray(whyUs.items)
          ? whyUs.items
          : baseData.whyUs?.features || [],
    },
    process: {
      ...(baseData.process || {}),
      ...process,
      steps: mergedProcessSteps,
    },
  };
}

export async function getSafeSiteContent(getter, pageKey) {
  try {
    const response = await getter(pageKey);
    return response?.data || null;
  } catch (error) {
    console.error(`Failed to fetch ${pageKey} site content`, error);
    return null;
  }
}
