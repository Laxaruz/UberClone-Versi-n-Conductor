export function canEnableAvailability(driverSession) {
  return driverSession?.approvalStatus === 'approved_demo';
}
