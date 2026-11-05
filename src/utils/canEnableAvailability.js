export function canEnableAvailability(driverSession, realtimeConnected) {
  return ['approved', 'approved_demo'].includes(driverSession?.approvalStatus) && realtimeConnected === true;
}
