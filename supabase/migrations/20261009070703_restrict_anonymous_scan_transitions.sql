-- Keep scan lifecycle changes limited to signed-in owners and the service role.
-- Explicitly remove anonymous grants inherited from existing project defaults.
revoke all on function public.transition_scan_lifecycle(uuid, public.scan_lifecycle_state, jsonb) from public, anon;
grant execute on function public.transition_scan_lifecycle(uuid, public.scan_lifecycle_state, jsonb) to authenticated, service_role;
