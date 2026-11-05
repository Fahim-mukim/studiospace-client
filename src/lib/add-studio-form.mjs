export function getHostInformation(user) {
  return {
    name: typeof user?.name === "string" ? user.name : "",
    email: typeof user?.email === "string" ? user.email : "",
    readOnly: true,
  };
}

export function getStudioImageUrlError(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "Image must be a valid HTTP(S) URL.";
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return "Image must be a valid HTTP(S) URL.";
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return "Image must be a valid HTTP(S) URL.";
  }
  if (value.trim().length > 2048) {
    return "Image URL must be 2048 characters or fewer.";
  }

  return null;
}

export function buildStudioPayload(values, cleanedAmenities) {
  const payload = {
    title: values.title.trim(),
    categorySlug: values.categorySlug,
    hourlyRate: Number(values.hourlyRate),
    securityDeposit: Number(values.securityDeposit),
    capacity: Number(values.capacity),
    location: values.location.trim(),
    image: values.image.trim(),
    amenities: cleanedAmenities,
    overview: values.overview.trim(),
  };

  if (values.imageAlt && values.imageAlt.trim()) {
    payload.imageAlt = values.imageAlt.trim();
  }

  return payload;
}
