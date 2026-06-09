/**
 * Resolves a Font Awesome solid icon class (without the "fas" prefix) from amenity title text.
 * Uses keyword rules so icons feel dynamic per row without requiring backend icon fields yet.
 */
export function resolveAmenityIconClass(title) {
  const t = String(title || "").toLowerCase();
  if (!t) return "fa-circle-check";

  const rules = [
    [/yoga|meditation|wellness|spa/, "fa-spa"],
    [/gym|fitness|workout|dumbbell/, "fa-dumbbell"],
    [/pool|swim|aqua/, "fa-swimmer"],
    [/park|garden|lawn|green|landscape|tree/, "fa-tree"],
    [/parking|car\s|valet|garage/, "fa-car"],
    [/security|cctv|gated|guard/, "fa-shield-alt"],
    [/wifi|internet|broadband/, "fa-wifi"],
    [/ac\b|air\s*condition|hvac|cooling/, "fa-snowflake"],
    [/lift|elevator/, "fa-sort"],
    [/club|lounge|community\s*hall|party/, "fa-glass-cheers"],
    [/retail|shop|high\s*street|store|mall/, "fa-store"],
    [/office|workspace|cowork/, "fa-building"],
    [/atrium|amphitheatre|amphitheater|court|plaza/, "fa-landmark"],
    [/residential|apartment|tower/, "fa-city"],
    [/water|fountain|jet|sprinkler/, "fa-tint"],
    [/jog|track|walk|trail/, "fa-running"],
    [/kids|play|crèche|creche|child/, "fa-child"],
    [/pet|dog/, "fa-paw"],
    [/power|backup|generator|solar/, "fa-bolt"],
    [/fire|safety|alarm|sprinkler/, "fa-fire-extinguisher"],
    [/concierge|reception|lobby/, "fa-concierge-bell"],
    [/terrace|balcony|deck|roof/, "fa-house-chimney"],
    [/cinema|theatre|theater|screen/, "fa-film"],
    [/library|reading/, "fa-book"],
    [/caf[eé]|restaurant|food\s*court|dining/, "fa-utensils"],
  ];

  for (const [pattern, icon] of rules) {
    if (pattern.test(t)) return icon;
  }

  return "fa-circle-check";
}
