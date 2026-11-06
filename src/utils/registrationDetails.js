// AI-assisted: see docs/AI_LOG.md #15
export function registrationDetails(registration) {
  return {
    displayName: registration.fullName.trim(),
    identityNumber: registration.identityNumber,
    phone: registration.phone,
    birthDate: registration.birthDate,
    gender: registration.gender,
    email: registration.email.trim(),
    language: registration.language,
    vehicleCategory: registration.category,
    plate: registration.plate,
    brand: registration.brand,
    model: registration.model,
    year: registration.year,
    color: registration.color,
    capacity: registration.capacity,
  };
}

export function restoreRegistrationDetails(current, driver) {
  if (!driver) return current;
  return {
    ...current,
    fullName: driver.displayName ?? current.fullName,
    identityNumber: driver.identityNumber ?? current.identityNumber,
    phone: driver.phone ?? current.phone,
    birthDate: driver.birthDate ?? current.birthDate,
    gender: driver.gender ?? current.gender,
    email: driver.email ?? current.email,
    language: driver.language ?? current.language,
    category: driver.vehicleCategory ?? current.category,
    plate: driver.plate ?? current.plate,
    brand: driver.brand ?? current.brand,
    model: driver.model ?? current.model,
    year: driver.year ?? current.year,
    color: driver.color ?? current.color,
    capacity: driver.capacity ?? current.capacity,
  };
}
