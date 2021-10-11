import { OscarServer, OscarSocket } from '../OscarServer';
import assert from 'assert';
import crypto from 'crypto';
import { hashClientPassword } from './hashClientLogin';
import { matchSnac, parseSnac } from '../snacUtils';
import {
    authKeyResponseSnac,
    loginErrorSnac,
    loginSuccessSnac,
} from './serverSnacs';
import { parseAuthRequest, parseMD5LoginRequest } from './clientSnacs';
import { FlapType, LoginError } from '../types';

/**
 * @summary The first server an Oscar Protocol client
 *          connects to when signing on. Confirms client
 *          credentials, and returns a cookie and address
 *          to contact the next service (the BOSS server)
 */
export class AIMAuthServer extends OscarServer {
    private socketState = new WeakMap<OscarSocket, SocketState>();

    private getState(oscarSocket: OscarSocket) {
        const state = this.socketState.get(oscarSocket);
        assert(state, 'Missing SocketState in AIMAuthServer');
        return state;
    }

    onConnection(oscarSocket: OscarSocket) {
        const { host, port } = oscarSocket.remoteAddress;
        console.log(`AIMAuthServer: New connection from ${host}:${port}`);

        oscarSocket.onFlap(FlapType.SIGNON, (flap) => {
            const flapVersion = flap.data.readUInt32BE(0);
            assert(flapVersion === 0x1, 'Incorrect client FLAP version');
        });

        oscarSocket.onFlap(FlapType.DATA, (flap) => {

            const state = this.getState(oscarSocket);
            const snac = parseSnac(flap.data);

            if (matchSnac(snac, 'AUTH', 'MD5_AUTH_REQUEST')) {
                const authReq = parseAuthRequest(snac.data);
                // Can be _any_ server generated string with len < size of u32 int
                const authKey = state.setSalt(
                    crypto.randomInt(100000000, 9999999999).toString(),
                );

                state.setScreenname(authReq.screenname);
                const responseFlap = {
                    type: FlapType.DATA,
                    data: authKeyResponseSnac(authKey, snac.requestID),
                };

                oscarSocket.write(responseFlap);
                return;
            }

            if (matchSnac(snac, 'AUTH', 'LOGIN_REQUEST')) {
                const payload = parseMD5LoginRequest(snac.data);
                assert(
                    payload.newHashStrategy,
                    'Pre-5.2 authentication not yet supported',
                );
                assert(
                    payload.screenname === state.getScreenname(),
                    'Challenge issued for one screenname, but used by another',
                );

                // TODO: Add persistence so we can have
                // non-hardcoded accounts
                const hashToMatch = hashClientPassword({
                    password: 'password',
                    salt: state.getSalt(),
                });
                const isValidUsername = true; // TODO: Real lookup
                const isValidPass = crypto.timingSafeEqual(
                    payload.passwordHash,
                    hashToMatch,
                );

                // TODO: handle various diff error types,
                // rather than mapping all to INCORRECT_NICK_OR_PASS
                if (!(isValidUsername && isValidPass)) {
                    const responseFlap = {
                        type: FlapType.DATA,
                        data: loginErrorSnac({
                            screenname: payload.screenname,
                            errorCode: LoginError.INCORRECT_NICK_OR_PASS,
                            errorURL: 'https://drewml.com',
                            reqID: snac.requestID,
                        }),
                    };

                    oscarSocket.write(responseFlap);
                    return;
                }

                const responseFlap = {
                    type: FlapType.DATA,
                    data: loginSuccessSnac({
                        screenname: payload.screenname,
                        // TODO: Should be pulled from DB when real
                        // persistence is added
                        email: 'dcostoy@users.noreply.github.com',
                        // Point to BOSS host/port
                        //bosAddress: 'host.test:5191',
                        bosAddress: 'titan.home.dco.st:5191',
			// TODO: Stop hardcoding BOSS cookie
                        authCookie: '111111111',
                        latestBetaVersion: '8.1.4',
                        latestBetaChecksum: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                        passwordChangeURL: 'https://drewml.com',
                        reqID: snac.requestID,
                    }),
                };

                oscarSocket.write(responseFlap);
                return;
            }
            console.log('AIMAuthServer data Flap: ', flap);
        });

        oscarSocket.onFlap(FlapType.ERROR, (flap) => {
            console.log('AIMAuthServer unhandled error flap: ', flap);
        });

        oscarSocket.onFlap(FlapType.SIGNOFF, (flap) => {
            // TODO: handle disconnect negotiation
            console.log('AIMAuthServer unhandled signoff flap: ', flap);
        });

        oscarSocket.onFlap(FlapType.KEEPALIVE, (flap) => {
            console.log('AIMAuthServer unhandled keepalive flap: ', flap);
        });

        // Initialize state needed for auth requests
        const socketState = new SocketState();
        this.socketState.set(oscarSocket, socketState);

        oscarSocket.sendStartFlap();
    }
}

class SocketState {
    private salt: string | undefined;
    private screenname: string | undefined;

    setScreenname(screenname: string) {
        return (this.screenname = screenname);
    }

    getScreenname() {
        assert(this.screenname, 'Missing screenname');
        return this.screenname;
    }

    setSalt(salt: string) {
        return (this.salt = salt);
    }

    getSalt() {
        assert(this.salt, 'Missing MD5 salt...somehow');
        return this.salt;
    }
}
