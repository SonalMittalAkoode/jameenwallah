const generateCustomId = () => `CID-${Math.floor(100000 + Math.random() * 900000)}`;

// Helper function to transform API property data to form format
export const transformPropertyForForm = (apiProperty) => {
  if (!apiProperty) return null;

  // Handle propertyType - could be object with name or just string/ID
  let propertyType = "";
  if (apiProperty.description?.propertyType) {
    if (typeof apiProperty.description.propertyType === "object") {
      propertyType = apiProperty.description.propertyType.name || apiProperty.description.propertyType._id || "";
    } else {
      propertyType = apiProperty.description.propertyType;
    }
  }

  // Handle category - could be object with name or just string/ID
  let category = "";
  if (apiProperty.description?.category) {
    if (typeof apiProperty.description.category === "object") {
      category = apiProperty.description.category.name || apiProperty.description.category._id || "";
    } else {
      category = apiProperty.description.category;
    }
  }

  // Handle assigned broker
  let assignedAgent = "";
  if (apiProperty.assignedBroker && apiProperty.assignedBroker.length > 0) {
    const broker = apiProperty.assignedBroker[0];
    if (typeof broker === "object") {
      assignedAgent = broker._id || broker.id || "";
    } else {
      assignedAgent = broker;
    }
  }

  // Handle amenities
  let amenities = [];
  if (Array.isArray(apiProperty.amenities)) {
    amenities = apiProperty.amenities
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return item._id || item.id || item.title || "";
        }
        return item || "";
      })
      .filter(Boolean);
  } else if (apiProperty.amenities) {
    if (typeof apiProperty.amenities === "object") {
      const value =
        apiProperty.amenities._id ||
        apiProperty.amenities.id ||
        apiProperty.amenities.title ||
        "";
      amenities = value ? [value] : [];
    } else {
      amenities = [apiProperty.amenities];
    }
  }

  // Handle location - state, city, area
  let state = "";
  let city = "";
  let area = "";
  if (apiProperty.location?.state) {
    if (typeof apiProperty.location.state === "object") {
      state = apiProperty.location.state.name || apiProperty.location.state._id || "";
    } else {
      state = apiProperty.location.state;
    }
  }
  if (apiProperty.location?.city) {
    if (typeof apiProperty.location.city === "object") {
      city = apiProperty.location.city.name || apiProperty.location.city._id || "";
    } else {
      city = apiProperty.location.city;
    }
  }
  if (apiProperty.location?.area) {
    if (typeof apiProperty.location.area === "object") {
      area = apiProperty.location.area.name || apiProperty.location.area._id || "";
    } else {
      area = apiProperty.location.area;
    }
  }

  return {
    personalDetails: {
      name: apiProperty.personalDetails?.name || "",
      email: apiProperty.personalDetails?.email || "",
      phoneNumber: apiProperty.personalDetails?.phoneNumber || "",
    },
    description: {
      title: apiProperty.description?.title || "",
      slug: apiProperty.description?.slug || "",
      description: apiProperty.description?.description || "",
      propertyType: propertyType,
      category: category,
      price: apiProperty.description?.price?.toString() || "",
      reraApproved: apiProperty.description?.reraApproved || "",
      reraNumber: apiProperty.description?.reraNumber || "",
      floorPlanName: apiProperty.description?.floorPlanName || "",
      floorPlanSize: apiProperty.description?.floorPlanSize || "",
      floorPlanPrice: apiProperty.description?.floorPlanPrice || "",
      featuredProperty: apiProperty.description?.featuredProperty || "",
    },
    location: {
      address: apiProperty.location?.address || "",
      state: state,
      city: city,
      area: area,
      zip: apiProperty.location?.zip || "",
      neighbourhood: apiProperty.location?.neighbourhood || "",
    },
    details: {
      sizeInFt: (apiProperty.details?.sizeInSqFt ?? apiProperty.details?.sizeInFt)?.toString() || "",
      lotSizeInFt: apiProperty.details?.lotSizeInFt?.toString() || "",
      rooms: apiProperty.details?.rooms?.toString() || "",
      bedrooms: apiProperty.details?.bedrooms?.toString() || "",
      bathrooms: apiProperty.details?.bathrooms?.toString() || "",
      parking: apiProperty.details?.parking || "",
      numberOfParkings:
        apiProperty.details?.numberOfParkings?.toString() ||
        apiProperty.details?.parkingSize?.toString() ||
        "",
      yearBuilt: apiProperty.details?.yearBuilt?.toString() || "",
      availableFrom: apiProperty.details?.availableFrom || "",
      basement: apiProperty.details?.basement || "",
      extraDetails: apiProperty.details?.extraDetails || "",
      floorsNo: apiProperty.details?.floorsNo?.toString() || "",
      customId: apiProperty.details?.customId || generateCustomId(category),
      balcony: apiProperty.details?.balcony?.toString() || "",
      exteriorMaterial: apiProperty.details?.exteriorMaterial || "",
      structureType: apiProperty.details?.structureType || [],
    },
    media: {
      images: apiProperty.media?.images || [],
      floorPlanImages: apiProperty.media?.floorPlanImages || [],
      videoLink: apiProperty.media?.videoLink || "",
      virtualTour: apiProperty.media?.virtualTour || "",
    },
    amenities,
    // Keep original ID and status
    _id: apiProperty._id,
    id: apiProperty._id,
    status: apiProperty.status || "pending",
    assignedAgent: assignedAgent,
  };
};
