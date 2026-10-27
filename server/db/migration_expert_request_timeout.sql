-- Align the expert-request status constraint with the values used by the API.
BEGIN;

ALTER TABLE expert_requests
DROP CONSTRAINT IF EXISTS expert_requests_status_check;

ALTER TABLE expert_requests
ADD CONSTRAINT expert_requests_status_check
CHECK (
    status IN (
        'pending',
        'assigned',
        'accepted',
        'resolved',
        'closed',
        'escalated',
        'rejected',
        'expired',
        'timeout'
    )
);

COMMIT;
