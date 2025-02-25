import { Application, NextFunction, Request, Response } from 'express';
import AuthenticationRequired from '../types/authentication-required';

function ossAuthHook(app: Application, baseUriPath: string): void {
    const generateAuthResponse = async () =>
        new AuthenticationRequired({
            type: 'password',
            path: `${baseUriPath}/auth/simple/login`,
            message: 'You must sign in order to use Unleash',
        });

    app.use(
        `${baseUriPath}/api`,
        async (req: Request, res: Response, next: NextFunction) => {
            // @ts-ignore
            if (req.session && req.session.user) {
                // @ts-ignore
                req.user = req.session.user;
                return next();
            }
            // @ts-ignore
            if (req.user) {
                return next();
            }
            if (req.header('authorization')) {
                // API clients should get 401 without body
                return res.sendStatus(401);
            }
            // Admin UI users should get auth-response
            const authRequired = await generateAuthResponse();
            return res.status(401).json(authRequired);
        },
    );
}
export default ossAuthHook;
