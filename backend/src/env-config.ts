type ENVIROMENTSTYPE = {
    host: {
        readonly address: string;
        readonly port: number;
    },
    database: {
        readonly url: string;
        readonly direct_url: string;
    },
};

export const ENVIROMENTS: ENVIROMENTSTYPE = {
    host: {
        get address() { return process.env.host!; },
        get port() { return Number(process.env.PORT!); }
    },
    database: {
        get url() {
            return process.env.DATABASE_URL!;
        },
        get direct_url() {
            return process.env.DIRECT_URL!;
        },
    }
};