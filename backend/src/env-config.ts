type ENVIROMENTSTYPE = {
    hosts: {
        api: {
            readonly host: string;
            readonly port: number;
            readonly url: string;
        }
        front: {
            readonly url: string;
        }
    },
    database: {
        readonly url: string;
        readonly direct_url: string;
    },
    storage: {
        readonly endpoint: string;
        readonly region: string;
        buckets: {
            readonly profiles: string;
            readonly photos: string;
        },
        readonly access_key_id: string;
        readonly secret_key: string;
        readonly session_token: string;
    },
    mail: {
        host: string,
        port: number,
        secure: boolean,
        auth: {
            user: string,
            pass: string
        }

    },
    secretesKeys: {
        jwtSecreteKey: string
    }
};

export const ENVIROMENTS: ENVIROMENTSTYPE = {
    hosts: {
        api: {
            get host() { return process.env.API_HOST!; },
            get port() { return Number(process.env.API_PORT!); },
            get url() {
                return process.env.API_URL!;
            }
        },
        front: {
            get url() {
                return process.env.FRONT_URL!;
            }
        }
    },
    database: {
        get url() {
            return process.env.DATABASE_URL!;
        },
        get direct_url() {
            return process.env.DIRECT_URL!;
        },
    },
    storage: {
        get endpoint() { return process.env.STORAGE_ENDPOINT! },
        get region() { return process.env.STORAGE_REGION! },
        get access_key_id() { return process.env.STORAGE_ACCESS_KEY_ID! },
        get secret_key() { return process.env.STORAGE_SECRET_KEY! },
        get session_token() { return process.env.STORAGE_SESSION_TOKEN! },
        buckets: {
            get profiles() { return process.env.BUCKET_PROFILES! },
            get photos() { return process.env.BUCKET_PHOTOS! },
        },
    },
    mail: {
        get host() { return process.env.MAIL_HOST! },
        get port() { return Number(process.env.MAIL_PORT!) },
        get secure() { return Boolean(process.env.MAIL_SECURE!) },
        auth: {
            get user() { return process.env.MAIL_USER! },
            get pass() { return process.env.MAIL_PASS! },
        },
    },
    secretesKeys: {
        get jwtSecreteKey() { return process.env.JWT_SECRETE_KEY! },
    }
};