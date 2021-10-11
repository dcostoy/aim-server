/**
 * @see http://iserverd1.khstu.ru/oscar/families.html
 */
export const SNACS = {
    GENERAL: {
        family: 0x1,
        subtypes: {
            CLIENT_READY: 0x2,
            SUPPORTED_FAMILIES: 0x3,
            SERVICE_XFER_REQUEST: 0x4,
            CLIENT_FAMILY_VERSIONS: 0x17,
            SERVER_FAMILY_VERSIONS: 0x18,
            RATE_INFO_REQUEST: 0x6,
            RATE_INFO_RESPONSE: 0x7,
            SELF_INFO_REQUEST: 0x0e,
            SELF_INFO_RESPONSE: 0x0f,
        },
    },
    LOCATION: {
        family: 0x2,
        subtypes: {
            LOCATION_RIGHTS_REQUEST: 0x2,
            LOCATION_RIGHTS_REPLY: 0x3,
        },
    },
    BUDDYLIST: {
        family: 0x3,
        subtypes: {
            BUDDY_LIST_RIGHTS_REQUEST: 0x2,
            BUDDY_LIST_RIGHTS_REPLY: 0x3,
        },
    },
    ICBM: {
        family: 0x4,
        subtypes: {
            ICBM_PARAM_REQUEST: 0x4,
            ICBM_PARAM_REPLY: 0x5,
            SEND_ICBM: 0x6,
            RECEIVE_ICBM: 0x7,
        },
    },
    INVITATION: {
        family: 0x6,
        subtypes: {},
    },
    ADMINISTRATIVE: {
        family: 0x7,
        subtypes: {},
    },
    POPUP_NOTICE: {
        family: 0x8,
        subtypes: {},
    },
    PRIVACY_MGMT: {
        family: 0x9,
        subtypes: {
            PRIVACY_RIGHTS_REQUEST: 0x2,
            PRIVACY_RIGHTS_REPLY: 0x3
        },
    },
    USER_LOOKUP: {
        family: 0x0a,
        subtypes: {},
    },
    USAGE_STATS: {
        family: 0x0b,
        subtypes: {
            CLIENT_STATS_REPORT: 0x3,
        },
    },
    SSI: {
        family: 0x13,
        subtypes: {
            SSI_LIMITS_REQUEST: 0x2,
            SSI_LIMITS_RESPONSE: 0x3,
            BUDDY_LIST_REQUEST: 0x4,
            BUDDY_LIST_RESPONSE: 0x6,
        },
    },
    OFFLINE: {
        family: 0x15,
        subtypes: {},
    },
    AUTH: {
        family: 0x17,
        subtypes: {
            REGISTRATION_REFUSED: 0x1,
            LOGIN_REQUEST: 0x2,
            LOGIN_REPLY: 0x3,
            REQUEST_NEW_UIN: 0x4,
            NEW_UIN_RESPONSE: 0x5,
            MD5_AUTH_REQUEST: 0x6,
            MD5_AUTH_RESPONSE: 0x7,
        },
    },
};
