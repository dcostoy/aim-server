import { timingSafeEqual } from 'crypto';
import { FlapType } from '../types';
import { 
    parseCookieRequest,
    parsaeSendIcbm,
 } from './clientSnacs';
import { OscarServer, OscarSocket } from '../OscarServer';
import {
    supportedFamiliesSnac,
    familyVersionsSnac,
    rateLimitInfoSnac,
    selfInfoSnac,
    ssiLimitsSnac,
    buddyListRequestSnac,
    buddyListRightsReply,
    locationRightsReply,
    icbmParams,
} from './serverSnacs';
import assert from 'assert';
import { parseSnac, matchSnac, prettyPrintSnac, buildSnac } from '../snacUtils';
import { UserClass, UserStatus } from './constants';
import { SNACS } from '../constants';

export class BossServer extends OscarServer {
    onConnection(oscarSocket: OscarSocket) {
        const { host, port } = oscarSocket.remoteAddress;
        console.log(`BossServer: New connection from ${host}:${port}`);

        oscarSocket.sendStartFlap();

        oscarSocket.onFlap(FlapType.SIGNON, (flap) => {
            const { authCookie } = parseCookieRequest(flap.data);
            // TODO: Grab cookie from shared storage with auth service
            const expectedCookie = Buffer.from('111111111', 'ascii');
            const validCookie = timingSafeEqual(authCookie, expectedCookie);

            // TODO: Unsure of what client expects for invalid cookie,
            //       maybe just a SIGNOFF flap? Let's just crash
            //       the server for now
            assert(validCookie, 'BossServer: Invalid auth cookie');

            const snac = supportedFamiliesSnac({ reqID: 1 });
            oscarSocket.write({ type: FlapType.DATA, data: snac });
        });

        oscarSocket.onFlap(FlapType.DATA, (flap) => {

            const snac = parseSnac(flap.data);
            if (matchSnac(snac, 'GENERAL', 'CLIENT_FAMILY_VERSIONS')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: familyVersionsSnac({ reqID: snac.requestID }),
                });
            }

            if (matchSnac(snac, 'GENERAL', 'RATE_INFO_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: rateLimitInfoSnac({ reqID: snac.requestID }),
                });
            }

            if (matchSnac(snac, 'GENERAL', 'SELF_INFO_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: selfInfoSnac({
                        screenName: 'dcostoy',
                        userClass: UserClass.ICQ,
                        userStatus: UserStatus.ONLINE,
                        externalIP: 0,
                        idleTime: 0,
                        signonTime: 0,
                        memberSince: 0,
                        reqID: snac.requestID,
                    }),
                });
            }

            if (matchSnac(snac, 'SSI', 'SSI_LIMITS_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: ssiLimitsSnac({ reqID: snac.requestID }),
                });
            }

            if (matchSnac(snac, 'USAGE_STATS', 'CLIENT_STATS_REPORT')) {
                // client stats report, can ignore
                return;
            }

            if (matchSnac(snac, 'GENERAL', 'CLIENT_READY')) {
                // TODO: mark client as online
                return;
            }

            if (matchSnac(snac, 'SSI', 'BUDDY_LIST_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: buddyListRequestSnac({reqID: snac.requestID}),
                });
            }

            if (matchSnac(snac, 'BUDDYLIST', 'BUDDY_LIST_RIGHTS_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: buddyListRightsReply({reqID: snac.requestID})
                });
            }

            if (matchSnac(snac, 'PRIVACY_MGMT', 'PRIVACY_RIGHTS_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: buddyListRightsReply({reqID: snac.requestID})
                });
            }

            if (matchSnac(snac, 'LOCATION', 'LOCATION_RIGHTS_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: locationRightsReply({reqID: snac.requestID})
                });
            }


             if (matchSnac(snac, 'ICBM', 'ICBM_PARAM_REQUEST')) {
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: icbmParams({reqID: snac.requestID})
                });                      
            }

            if (matchSnac(snac, "ICBM", "SEND_ICBM")) {
                parsaeSendIcbm(snac.data);
                //send a fake reply
                const data = Buffer.from([0x00, 0x04, 0x00, 0x07, 0x00, 0x00, 0x90, 0x2F, 0x30, 0x11, 0x70, 0x95, 0xA0, 0x00, 0x26, 0x1F, 0x00, 0x00, 0x00, 0x02, 0x07, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x02, 0x00, 0x50, 0x00, 0x06, 0x00, 0x04, 0x20, 0x12, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x04, 0x00, 0x00, 0x06, 0xF3, 0x00, 0x03, 0x00, 0x04, 0x40, 0x5A, 0x93, 0x78, 0x00, 0x05, 0x01, 0x5B, 0x00, 0x00, 0x70, 0x95, 0xA0, 0x00, 0x26, 0x1F, 0x00, 0x00, 0x09, 0x46, 0x13, 0x49, 0x4C, 0x7F, 0x11, 0xD1, 0x82, 0x22, 0x44, 0x45, 0x53, 0x54, 0x00, 0x00, 0x00, 0x0A, 0x00, 0x02, 0x00, 0x01, 0x00, 0x0F, 0x00, 0x00, 0x27, 0x11, 0x01, 0x33, 0x1B, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0xE3, 0xFF, 0x0E, 0x00, 0xE3, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x21, 0x00, 0xCC, 0x00, 0x7B, 0x5C, 0x72, 0x74, 0x66, 0x31, 0x5C, 0x61, 0x6E, 0x73, 0x69, 0x5C, 0x61, 0x6E, 0x73, 0x69, 0x63, 0x70, 0x67, 0x31, 0x32, 0x35, 0x31, 0x5C, 0x64, 0x65, 0x66, 0x66, 0x30, 0x5C, 0x64, 0x65, 0x66, 0x6C, 0x61, 0x6E, 0x67, 0x31, 0x30, 0x34, 0x39, 0x7B, 0x5C, 0x66, 0x6F, 0x6E, 0x74, 0x74, 0x62, 0x6C, 0x7B, 0x5C, 0x66, 0x30, 0x5C, 0x66, 0x6E, 0x69, 0x6C, 0x5C, 0x66, 0x63, 0x68, 0x61, 0x72, 0x73, 0x65, 0x74, 0x32, 0x30, 0x34, 0x7B, 0x5C, 0x2A, 0x5C, 0x66, 0x6E, 0x61, 0x6D, 0x65, 0x20, 0x4D, 0x53, 0x20, 0x53, 0x61, 0x6E, 0x73, 0x20, 0x53, 0x65, 0x72, 0x69, 0x66, 0x3B, 0x7D, 0x4D, 0x53, 0x20, 0x53, 0x68, 0x65, 0x6C, 0x6C, 0x20, 0x44, 0x6C, 0x67, 0x3B, 0x7D, 0x7D, 0x0D, 0x0A, 0x7B, 0x5C, 0x63, 0x6F, 0x6C, 0x6F, 0x72, 0x74, 0x62, 0x6C, 0x20, 0x3B, 0x5C, 0x72, 0x65, 0x64, 0x30, 0x5C, 0x67, 0x72, 0x65, 0x65, 0x6E, 0x30, 0x5C, 0x62, 0x6C, 0x75, 0x65, 0x30, 0x3B, 0x7D, 0x0D, 0x0A, 0x5C, 0x76, 0x69, 0x65, 0x77, 0x6B, 0x69, 0x6E, 0x64, 0x34, 0x5C, 0x75, 0x63, 0x31, 0x5C, 0x70, 0x61, 0x72, 0x64, 0x5C, 0x63, 0x66, 0x31, 0x5C, 0x66, 0x30, 0x5C, 0x66, 0x73, 0x32, 0x30, 0x3C, 0x23, 0x23, 0x69, 0x63, 0x71, 0x69, 0x6D, 0x61, 0x67, 0x65, 0x30, 0x30, 0x30, 0x38, 0x3E, 0x5C, 0x70, 0x61, 0x72, 0x0D, 0x0A, 0x7D, 0x0D, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x26, 0x00, 0x00, 0x00, 0x7B, 0x39, 0x37, 0x42, 0x31, 0x32, 0x37, 0x35, 0x31, 0x2D, 0x32, 0x34, 0x33, 0x43, 0x2D, 0x34, 0x33, 0x33, 0x34, 0x2D, 0x41, 0x44, 0x32, 0x32, 0x2D, 0x44, 0x36, 0x41, 0x42, 0x46, 0x37, 0x33, 0x46, 0x31, 0x34, 0x39, 0x32, 0x7D]);
                return oscarSocket.sendTestMessage({
                    type: FlapType.DATA,
                    data: buildSnac({
                        family: SNACS.ICBM.family,
                        subtype: SNACS.ICBM.subtypes.RECEIVE_ICBM,
                        reqID: 69,
                        data: data
                    })
                });
            }

            console.log('BOSS: unhandled snac:');
            console.log(prettyPrintSnac(snac));            
        });

        oscarSocket.onFlap(FlapType.ERROR, (flap) => {
            console.log('boss error flap: ', flap);
        });

        oscarSocket.onFlap(FlapType.SIGNOFF, (flap) => {
            console.log('boss signoff flap: ', flap);
        });

        oscarSocket.onFlap(FlapType.KEEPALIVE, (flap) => {
            console.log('boss keepalive flap: ', flap);
        });
    }
}
