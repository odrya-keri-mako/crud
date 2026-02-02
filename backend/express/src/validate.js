const MAX_IMAGE_KB = 64;

function isNonEmptyString(v, max = 255) {
  return typeof v === "string" && 
         v.trim().length > 0 && 
         v.trim().length <= max;
}

function isIntRange(v, min, max) {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
}

function base64ByteLength(base64) {
  const s = (base64 || "").replace(/\s/g, "");
  if (!s) return 0;
  const padding = (s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0);
  return Math.floor((s.length * 3) / 4) - padding;
}

function validateInsectPayload(body, { requireAll = true } = {}) {
  const errors = [];

  const {
    name,
    img,
    img_type,
    type,
    metamorphosis,
    role,
    active_months,
    utility_level,
  } = body || {};

  const need = (field) => requireAll || body[field] !== undefined;

  if (need("name") && !isNonEmptyString(name, 255)) 
    errors.push("name invalid");
  if (need("type") && !isNonEmptyString(type, 50)) 
    errors.push("type invalid");
  if (need("metamorphosis") && !isNonEmptyString(metamorphosis, 20)) 
    errors.push("metamorphosis invalid");
  if (need("role") && !isNonEmptyString(role, 50)) 
    errors.push("role invalid");
  if (need("active_months") && !isNonEmptyString(active_months, 255)) 
    errors.push("active_months invalid");
  if (need("utility_level") && !isIntRange(utility_level, 1, 5)) 
    errors.push("utility_level must be 1-5");

  if (img !== undefined && img !== null && img !== "") {
    if (!isNonEmptyString(img_type, 50) || 
        !img_type.toLowerCase().startsWith("image/")) {
      errors.push("img_type invalid");
    }
    const bytes = base64ByteLength(img);
    if (bytes > MAX_IMAGE_KB * 1024) 
      errors.push(`img too large (max ${MAX_IMAGE_KB}KB)`);
  }

  return errors;
}

export default { validateInsectPayload };