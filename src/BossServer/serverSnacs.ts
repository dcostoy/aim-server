import { buildSnac } from '../snacUtils';
import { SNACS } from '../constants';
import { uint16 } from '../buf';
import { UserClass, UserStatus } from './constants';

/**
 * @see http://iserverd.khstu.ru/oscar/snac_01_03.html
 */
export function supportedFamiliesSnac(opts: { reqID: number }) {
    /**
     * @see http://iserverd.khstu.ru/oscar/families.html
     */
    const families = uint16([
        SNACS.GENERAL.family,
        SNACS.LOCATION.family,
        SNACS.BUDDYLIST.family,
        SNACS.ICBM.family,
        SNACS.INVITATION.family,
        SNACS.ADMINISTRATIVE.family,
        SNACS.POPUP_NOTICE.family,
        SNACS.PRIVACY_MGMT.family,
        SNACS.USER_LOOKUP.family,
        SNACS.USAGE_STATS.family,
        SNACS.SSI.family,
        SNACS.OFFLINE.family,
    ]);

    return buildSnac({
        family: SNACS.GENERAL.family,
        subtype: SNACS.GENERAL.subtypes.SUPPORTED_FAMILIES,
        reqID: opts.reqID,
        data: families,
    });
}

/**
 * @see http://iserverd.khstu.ru/oscar/snac_01_18.html
 */
export function familyVersionsSnac(opts: { reqID: number }) {
    // Note: The official Oscar protocol docs claim something
    // completely different for this snac. But the unofficial
    // docs seem to be correct (weird)
    // http://web.archive.org/web/20080308233204/http://dev.aol.com/aim/oscar/#OSERVICE__MIGRATE_GROUPS

    // prettier-ignore
    const versions = uint16([
        // family, version
        SNACS.GENERAL.family, 0x3,
        SNACS.LOCATION.family, 0x1,
        SNACS.BUDDYLIST.family, 0x1,
        SNACS.ICBM.family, 0x1,
        SNACS.INVITATION.family, 0x1,
        SNACS.ADMINISTRATIVE.family, 0x1,
        SNACS.POPUP_NOTICE.family, 0x1,
        SNACS.PRIVACY_MGMT.family, 0x1,
        SNACS.USER_LOOKUP.family, 0x1,
        SNACS.USAGE_STATS.family, 0x1,
        SNACS.SSI.family, 0x1,
        SNACS.OFFLINE.family, 0x1,
    ]);

    return buildSnac({
        family: SNACS.GENERAL.family,
        subtype: SNACS.GENERAL.subtypes.SERVER_FAMILY_VERSIONS,
        reqID: opts.reqID,
        data: versions,
    });
}

/**
 * @description Create a SNAC specifying the server-enforced
 *              rate limits. Note that this server currently
 *              doesn't enforce rate limits, this is just a
 *              necessary part of the signon process
 * @see http://iserverd.khstu.ru/oscar/snac_01_07.html
 * @see http://web.archive.org/web/20060113101258/http://joust.kano.net/wiki/oscar/moin.cgi/RateLimiting
 * @see http://web.archive.org/web/20080308233204/http://dev.aol.com/aim/oscar/#RATELIMIT
 */
export function rateLimitInfoSnac(opts: { reqID: number }) {
    // prettier-ignore
    const data = Buffer.from([
        0x0, 0x0, // uint16, number of rate classes
        // Here is where all the rate classes would normally go.
        // Luckily we can save a bunch of time because AIM clients
        // (at least 5.2) will accept 0 total rate classes, as far
        // as I can tell. Will likely implement proper rate classes
        // when the server itself has rate limiting functionality
    ]);

    return buildSnac({
        family: SNACS.GENERAL.family,
        subtype: SNACS.GENERAL.subtypes.RATE_INFO_RESPONSE,
        reqID: opts.reqID,
        data,
    });
}
/**
 * @see http://iserverd.khstu.ru/oscar/snac_01_0f.html
 */
export function selfInfoSnac(opts: {
    screenName: string;
    userClass: UserClass;
    userStatus: UserStatus;
    externalIP: number; // todo: just accept a string and convert it
    idleTime: number;
    signonTime: number;
    memberSince: number;
    reqID: number;
}) {
    // todo: cleanup copypasta
    const data = Buffer.from([
        0xd, // screenname ascii length
        0x78,
        0x58,
        0x41,
        0x6f,
        0x6c,
        0x34,
        0x4c,
        0x79,
        0x66,
        0x65,
        0x58,
        0x78,
        0x72,
        0x00,
        0x00,
        0x00,
        0x06,
        0x00,
        0x01,
        0x00,
        0x02,
        0x00,
        0x90,
        0x00,
        0x0f,
        0x00,
        0x04,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x03,
        0x00,
        0x04,
        0x41,
        0xe9,
        0xb4,
        0xbb,
        0x00,
        0x0a,
        0x00,
        0x04,
        0x44,
        0xe3,
        0xa7,
        0x35,
        0x00,
        0x1e,
        0x00,
        0x04,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x05,
        0x00,
        0x04,
        0x38,
        0xc4,
        0x76,
        0xe8,
    ]);

    return buildSnac({
        family: SNACS.GENERAL.family,
        subtype: SNACS.GENERAL.subtypes.SELF_INFO_RESPONSE,
        reqID: opts.reqID,
        data,
    });
}

/**
 * @see http://iserverd.khstu.ru/oscar/snac_13_03.html
 */
export function ssiLimitsSnac(opts: { reqID: number }) {
    // copypasta, cleanup later
    const data = Buffer.from([
        0x00,
        0x04,
        0x00,
        0x34,
        0x01,
        0x90,
        0x00,
        0x3d,
        0x00,
        0xc8,
        0x00,
        0xc8,
        0x00,
        0x01,
        0x00,
        0x01,
        0x00,
        0x96,
        0x00,
        0x0c,
        0x00,
        0x0c,
        0x00,
        0x00,
        0x00,
        0x32,
        0x00,
        0x32,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x0f,
        0x00,
        0x01,
        0x00,
        0x28,
        0x00,
        0x01,
        0x00,
        0x0a,
        0x00,
        0xc8,
        0x00,
        0x02,
        0x00,
        0x02,
        0x00,
        0xfe,
        0x00,
        0x03,
        0x00,
        0x02,
        0x01,
        0xfc,
        0x00,
        0x05,
        0x00,
        0x02,
        0x00,
        0x64,
        0x00,
        0x06,
        0x00,
        0x02,
        0x00,
        0x61,
        0x00,
        0x07,
        0x00,
        0x02,
        0x00,
        0xc8,
        0x00,
        0x08,
        0x00,
        0x02,
        0x00,
        0x0a,
        0x00,
        0x09,
        0x00,
        0x04,
        0x00,
        0x06,
        0x97,
        0x80,
        0x00,
        0x0a,
        0x00,
        0x04,
        0x00,
        0x00,
        0x00,
        0x0e,
    ]);

    return buildSnac({
        family: SNACS.SSI.family,
        subtype: SNACS.SSI.subtypes.SSI_LIMITS_RESPONSE,
        reqID: opts.reqID,
        data,
    });
}

// export function clientReady(opts: {

// }) {
//     return buildSnac({
        
//     });
// }

export function buddyListRequestSnac(opts: { reqID: number}) {
    // const data = Buffer.from([
    //     0,
    //     0, 1,

    // ]);

    // const data = Buffer.from([
    //     0x00, 0x07, 0x36, 0x32, 0x31, 0x38, 0x38, 39,  37, 0x0A, 0x1E, 0x43, 0x18, 0x00, 0x00, 0x00,
    //     0x0A, 0x01, 0x31, 0x00, 0x06, 0x46, 0x75, 0x6E,  0x42, 0x6F, 0x6F
    // ])

    const data = Buffer.from([0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0d, 0x00, 0x00, 0x08, 0x00, 0x07, 0x36, 0x32, 0x31, 0x38, 0x38, 0x39, 0x37, 0x0A, 0x1E, 0x43, 0x18, 0x00, 0x00, 0x00, 0x0A, 0x01, 0x31, 0x00, 0x06, 0x46, 0x75, 0x6E, 0x42, 0x6F, 0x6F, 0x00, 0x09, 0x31, 0x37, 0x36, 0x33, 0x33, 0x33, 0x30, 0x37, 0x38, 0x17, 0xB7, 0x2A, 0x18, 0x00, 0x00, 0x00, 0x09, 0x01, 0x31, 0x00, 0x05, 0x45, 0x2E, 0x53, 0x2E, 0x56, 0x00, 0x07, 0x36, 0x32, 0x31, 0x38, 0x38, 0x39, 0x38, 0x23, 0x8C, 0x12, 0xA1, 0x00, 0x00, 0x00, 0x09, 0x01, 0x31, 0x00, 0x05, 0x74, 0x68, 0x6F, 0x72, 0x64, 0x00, 0x07, 0x46, 0x72, 0x69, 0x65, 0x6E, 0x64, 0x73, 0x7F, 0xED, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x0A, 0x43, 0x6F, 0x2D, 0x57, 0x6F, 0x72, 0x6B, 0x65, 0x72, 0x73, 0x55, 0x7F, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x07, 0x36, 0x32, 0x31, 0x38, 0x38, 0x39, 0x35, 0x23, 0x8C, 0x08, 0x80, 0x00, 0x00, 0x00, 0x0D, 0x01, 0x31, 0x00, 0x09, 0x52, 0x65, 0x67, 0x72, 0x65, 0x73, 0x73, 0x6F, 0x72, 0x00, 0x07, 0x36, 0x32, 0x35, 0x31, 0x37, 0x32, 0x33, 0x23, 0x8C, 0x05, 0x83, 0x00, 0x00, 0x00, 0x0D, 0x01, 0x31, 0x00, 0x05, 0x47, 0x68, 0x6F, 0x73, 0x74, 0x00, 0x66, 0x00, 0x00, 0x00, 0x07, 0x36, 0x32, 0x31, 0x33, 0x39, 0x34, 0x39, 0x23, 0x8C, 0x26, 0x9A, 0x00, 0x00, 0x00, 0x0D, 0x01, 0x31, 0x00, 0x05, 0x6D, 0x69, 0x63, 0x6B, 0x79, 0x00, 0x66, 0x00, 0x00, 0x3B, 0xB7, 0x4B, 0x7D]);

    return buildSnac({
        family: SNACS.SSI.family,
        subtype: SNACS.SSI.subtypes.BUDDY_LIST_RESPONSE,
        reqID: opts.reqID,
        data
    });
}

export function buddyListRightsReply(opts: { reqID: number}) {
    const data = Buffer.from([0x00, 0x03, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x02, 0xEE, 0x00, 0x01, 0x00, 0x02, 0x02, 0x58, 0x00, 0x03, 0x00, 0x02, 0x02, 0x00]);

    return buildSnac({
        family: SNACS.BUDDYLIST.family,
        subtype: SNACS.BUDDYLIST.subtypes.BUDDY_LIST_RIGHTS_REPLY,
        reqID: opts.reqID,
        data
    })
}

export function privacyRightsReply(opts: { reqID: number}) {
    const data = Buffer.from([0x00, 0x09, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02, 0x00, 0xC8, 0x00, 0x01, 0x00, 0x02, 0x00, 0xC8]);

    return buildSnac({
        family: SNACS.PRIVACY_MGMT.family,
        subtype: SNACS.PRIVACY_MGMT.subtypes.PRIVACY_RIGHTS_REPLY,
        reqID: opts.reqID,
        data
    })
}

export function locationRightsReply(opts: { reqID: number}) {
    const data = Buffer.from([0x00, 0x02, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x02, 0x04, 0x00, 0x00, 0x02, 0x00, 0x02, 0x00, 0x10, 0x00, 0x03, 0x00, 0x02, 0x00, 0x0A, 0x00, 0x04, 0x00, 0x02, 0x10, 0x00]);

    return buildSnac({
        family: SNACS.LOCATION.family,
        subtype: SNACS.LOCATION.subtypes.LOCATION_RIGHTS_REPLY,
        reqID: opts.reqID,
        data
    })
}

export function icbmParams(opts: { reqID: number}) {
    const data = Buffer.from([0x00, 0x04, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x02, 0x00, 0x00, 0x00, 0x03, 0x02, 0x00, 0x03, 0xE7, 0x03, 0xE7, 0x00, 0x00, 0x03, 0xE8]);

    return buildSnac({
        family: SNACS.ICBM.family,
        subtype: SNACS.ICBM.subtypes.ICBM_PARAM_REPLY,
        reqID: opts.reqID,
        data
    })
}
