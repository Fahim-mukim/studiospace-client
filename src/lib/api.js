export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");
}

export class ApiError extends Error {
  constructor(
    message,
    { status = 500, code = "API_ERROR", details = null } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Builds a full URL for the API with properly encoded query parameters.
 */
export function buildApiUrl(path, query = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}${normalizedPath}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/**
 * Normalizes a studio object from the server to ensure consistency
 * across UI components (handling title vs name, hourlyRate vs rate, gallery, host, etc.).
 */
export function normalizeStudio(studio) {
  if (!studio || typeof studio !== "object") return null;

  const id = studio.id || (studio._id ? String(studio._id) : "");
  const title = studio.title || studio.name || "Untitled Studio";
  const name = studio.name || studio.title || "Untitled Studio";
  const hourlyRate =
    typeof studio.hourlyRate === "number"
      ? studio.hourlyRate
      : Number(studio.hourlyRate) || 0;
  const rate = studio.rate || (hourlyRate ? `$${hourlyRate}` : "$0");

  const capacityNumber =
    typeof studio.capacity === "number"
      ? studio.capacity
      : Number(studio.capacity);
  const capacity = Number.isFinite(capacityNumber)
    ? `Up to ${capacityNumber}`
    : studio.capacity || "Flexible";

  const ratingValue =
    typeof studio.rating === "number"
      ? studio.rating
      : Number(studio.rating) || 0;
  const rating =
    studio.rating !== undefined && studio.rating !== null && studio.rating !== ""
      ? String(studio.rating)
      : "New";
  const reviewCount =
    typeof studio.reviewCount === "number"
      ? studio.reviewCount
      : Number(studio.reviewCount) || 0;

  const mainImage = studio.image || "/images/studios/daylight-loft.jpg";
  const mainImageAlt = studio.imageAlt || title;

  // Build a normalized gallery array of { src, alt }
  let gallery = [];
  if (Array.isArray(studio.gallery) && studio.gallery.length > 0) {
    gallery = studio.gallery.map((img) =>
      typeof img === "string" ? { src: img, alt: title } : img,
    );
  } else if (Array.isArray(studio.images) && studio.images.length > 0) {
    gallery = studio.images.map((src, idx) => ({
      src: typeof src === "string" ? src : src.src,
      alt: typeof src === "object" && src.alt ? src.alt : `${title} image ${idx + 1}`,
    }));
  } else {
    gallery = [{ src: mainImage, alt: mainImageAlt }];
  }

  // Specifications array
  const specifications = Array.isArray(studio.specifications)
    ? studio.specifications
    : [
        { label: "Suggested use", value: studio.category || "Creative projects" },
        { label: "Location", value: studio.location || "City workspace" },
        { label: "Capacity", value: capacity },
      ];

  // Host info
  const host =
    studio.host && typeof studio.host === "object"
      ? {
          name: studio.host.name || studio.host.displayName || "Verified Host",
          role: studio.host.role || "Studio Host",
          bio: studio.host.bio || "Welcoming host on StudioSpace.",
          avatar: studio.host.avatar || studio.host.profileImage || null,
        }
      : {
          name: "StudioSpace Host",
          role: "Studio Host",
          bio: "Welcoming host on StudioSpace.",
          avatar: null,
        };

  // Reviews array
  const reviews = Array.isArray(studio.reviews) ? studio.reviews : [];

  return {
    ...studio,
    id,
    title,
    name,
    slug: studio.slug || id,
    category: studio.category || "Creative Space",
    categorySlug: studio.categorySlug || "",
    hourlyRate,
    rate,
    securityDeposit:
      typeof studio.securityDeposit === "number"
        ? studio.securityDeposit
        : Number(studio.securityDeposit) || 0,
    capacity,
    capacityCount: Number.isFinite(capacityNumber) ? capacityNumber : 0,
    location: studio.location || "Location not specified",
    image: mainImage,
    imageAlt: mainImageAlt,
    gallery,
    specifications,
    amenities: Array.isArray(studio.amenities) ? studio.amenities : [],
    overview: studio.overview || "",
    rating,
    ratingValue,
    reviewCount,
    host,
    reviews,
  };
}

/**
 * Safe fetch wrapper that handles network errors, parses JSON,
 * and formats standardized ApiError on failure.
 */
export async function fetchApi(path, { query, headers, ...fetchOptions } = {}) {
  const url = buildApiUrl(path, query);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...headers,
      },
      ...fetchOptions,
    });
  } catch (networkError) {
    throw new ApiError(
      "Unable to connect to the StudioSpace API. Ensure the server is running.",
      { status: 503, code: "NETWORK_ERROR", details: networkError.message },
    );
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      body?.message || `Request failed with status ${response.status}`;
    const code =
      body?.code || (response.status === 404 ? "NOT_FOUND" : "API_ERROR");
    throw new ApiError(message, {
      status: response.status,
      code,
      details: body?.details ?? null,
    });
  }

  return body;
}

/**
 * Fetches studios from the Express API with query filters.
 */
export async function getStudios(params = {}, options = {}) {
  const query = {};

  if (params.category && params.category !== "all") {
    query.category = params.category;
  }

  if (typeof params.search === "string" && params.search.trim()) {
    query.search = params.search.trim().slice(0, 100);
  }

  if (
    params.minPrice !== undefined &&
    params.minPrice !== "" &&
    params.minPrice !== "all"
  ) {
    const min = Number(params.minPrice);
    if (Number.isFinite(min) && min >= 0) query.minPrice = min;
  }

  if (
    params.maxPrice !== undefined &&
    params.maxPrice !== "" &&
    params.maxPrice !== "all"
  ) {
    const max = Number(params.maxPrice);
    if (Number.isFinite(max) && max >= 0) query.maxPrice = max;
  }

  if (params.sort) {
    if (
      params.sort === "newest" ||
      params.sort === "price-low" ||
      params.sort === "price-high"
    ) {
      query.sort = params.sort;
    } else if (params.sort === "recommended") {
      query.sort = "newest";
    }
  }

  if (params.page) {
    const pageNum = Number(params.page);
    if (Number.isInteger(pageNum) && pageNum > 0) query.page = pageNum;
  }

  if (params.limit) {
    const limitNum = Number(params.limit);
    if (Number.isInteger(limitNum) && limitNum > 0 && limitNum <= 100) {
      query.limit = limitNum;
    }
  }

  const result = await fetchApi("/api/studios", {
    query,
    ...options,
  });

  const rawList = Array.isArray(result?.data) ? result.data : [];
  let studios = rawList.map(normalizeStudio);

  if (params.sort === "rating") {
    studios = [...studios].sort((a, b) => b.ratingValue - a.ratingValue);
  }

  const pagination = result?.pagination || {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 20,
    total: studios.length,
    totalPages: Math.ceil(studios.length / (Number(query.limit) || 20)) || 1,
  };

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    studios,
    pagination,
  };
}

/**
 * Fetches a single studio by MongoDB ObjectId or unique slug.
 */
export async function getStudioById(idOrSlug, options = {}) {
  if (!idOrSlug) {
    throw new ApiError("Studio ID or slug is required", { status: 400 });
  }

  const result = await fetchApi(
    `/api/studios/${encodeURIComponent(idOrSlug)}`,
    options,
  );

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    studio: normalizeStudio(result?.data),
  };
}

/**
 * Creates a new studio. Requires an authenticated session (credentials included).
 */
export async function createStudio(studioData, options = {}) {
  const result = await fetchApi("/api/studios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(studioData),
    credentials: "include",
    ...options,
  });

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    studio: normalizeStudio(result?.data),
    data: result?.data || null,
  };
}

/**
 * Fetches studios owned by the currently authenticated user.
 */
export async function getMyStudios(options = {}) {
  const result = await fetchApi("/api/studios/mine", {
    credentials: "include",
    ...options,
  });

  const rawList = Array.isArray(result?.data) ? result.data : [];
  const studios = rawList.map(normalizeStudio).filter(Boolean);

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    studios,
  };
}

/**
 * Updates an existing studio. Requires ownership (credentials included).
 */
export async function updateStudio(idOrSlug, studioData, options = {}) {
  const result = await fetchApi(
    `/api/studios/${encodeURIComponent(idOrSlug)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(studioData),
      credentials: "include",
      ...options,
    },
  );

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    studio: normalizeStudio(result?.data),
    data: result?.data || null,
  };
}

export async function createBooking(bookingData, options = {}) {
  const result = await fetchApi("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(bookingData),
    credentials: "include",
    ...options,
  });

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    booking: result?.data || null,
  };
}

export async function getMyBookings(options = {}) {
  const result = await fetchApi("/api/bookings/mine", {
    credentials: "include",
    ...options,
  });

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    bookings: Array.isArray(result?.data) ? result.data : [],
  };
}

export async function cancelBooking(bookingId, options = {}) {
  const result = await fetchApi(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "PATCH",
    credentials: "include",
    ...options,
  });

  return {
    success: Boolean(result?.success),
    message: result?.message || "",
    booking: result?.data || null,
  };
}
