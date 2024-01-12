import http from "http";
import { AddressInfo } from "node:net";

export type DumboRequestLog = {
    url: URL;
    method: string;
    body: string;
};

export type DumboServerStartResult = {
    port: number;
};

type MockedResponse = {
    statusCode: number;
    body?: string;
};

type MockResponseRoute = {
    method: string;
    path: string;
    getResponse: () => MockedResponse;
};

export type DumboServer = {
    Start: (port?: number) => Promise<DumboServerStartResult>;
    Stop: () => Promise<void>;
    GetRequests: () => DumboRequestLog[];
    ClearRequests: () => void;
    ConfigureResponse: (method: string, path: string, response: () => MockedResponse) => void;
};

export function CreateServer(): DumboServer {
    const server = http.createServer();
    const requests: DumboRequestLog[] = [];
    const mockResponseRoutes: MockResponseRoute[] = [];

    let body: any[] = [];

    server.on("request", (request, response) => {
        request.on("data", (chunk) => {
            body.push(chunk);
        }).on("end", () => {
            let bodyString = Buffer.concat(body).toString();
            body = [];

            requests.push({
                url: new URL(request.url, `http://${request.headers.host}`),
                method: request.method,
                body: bodyString,
            });

            const mockedResponseRoute = mockResponseRoutes
                .find(r => r.path === request.url && r.method === request.method);

            if (mockedResponseRoute) {
                const { statusCode, body } = mockedResponseRoute.getResponse();
                response.statusCode = statusCode;

                if (body) {
                    response.write(JSON.stringify(body));
                }
            }

            response.end();
        });
    });

    return {
        Start: async (port?: number): Promise<DumboServerStartResult> => {
            return new Promise<DumboServerStartResult>((res, rej) => {
                server.listen(port ?? 0, "localhost", () => {
                    res({
                        port: (server.address() as AddressInfo)?.port ?? null,
                    });
                });
            });
        },
        Stop: async (): Promise<void> => {
            return new Promise((res, rej) => {
                server.close(() => {
                    res();
                });
            });
        },
        GetRequests: () => {
            return requests;
        },
        ClearRequests: () => {
            requests.length = 0;
        },
        ConfigureResponse: (method, path, response) => {
            mockResponseRoutes.push({
                method: method,
                path: path,
                getResponse: response,
            });
        },
    };
}
