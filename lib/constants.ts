const constants = {
    SITE_NAME: 'Auth Next.js',
    SITE_DESCRIPTION: 'Next.js Auth Template',

    EMAIL_VERIFICATION_MAX_ATTEMPTS: 3,
    EMAIL_VERIFICATION_CODE_EXPIRY: 30 * 60 * 1000, // 30 minute
    EMAIL_VERIFICATION_COOKIE_NAME: 'auth_email_verification',
    SESSION_COOKIE_NAME: 'auth_session',
    SESSION_TOKEN_EXPIRY: 1000 * 60 * 60 * 24 * 60 * 2, // 2 months
    SESSION_TOKEN_RENEWAL_INTERVAL: 1000 * 60 * 60 * 24 * 15, // 15 day
};

export default constants;
