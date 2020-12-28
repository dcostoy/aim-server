import { timingSafeEqual } from 'crypto';
import { FlapType } from '../types';
import { parseCookieRequest } from './clientSnacs';
import { OscarServer, OscarSocket } from '../OscarServer';
import {
    supportedFamiliesSnac,
    familyVersionsSnac,
    rateLimitInfoSnac,
    selfInfoSnac,
    ssiLimitsSnac,
} from './serverSnacs';
import assert from 'assert';
import { parseSnac, matchSnac } from '../snacUtils';

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
                // TODO: actually implement selfInfoSnac
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: selfInfoSnac({ reqID: snac.requestID }),
                });
            }

            if (matchSnac(snac, 'SSI', 'SSI_LIMITS_REQUEST')) {
                // TODO: actually implement ssiLimitsSnac
                return oscarSocket.write({
                    type: FlapType.DATA,
                    data: ssiLimitsSnac({ reqID: snac.requestID }),
                });
            }

            console.log('boss unhandled data flap: ', flap);
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
