import { CreateServer, MumboRequestLog, MumboServerStartResult } from "@Mumbo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Starting and stopping the server", () => {
    describe("Start server with specified port", () => {
        let server = CreateServer();
        let response: Response | null = null;
        let serverStartResult: MumboServerStartResult | null = null;

        beforeAll(async () => {
            serverStartResult = await server.Start(9091);
            response = await fetch(`http://localhost:9091`);
        });

        afterAll(async () => {
            await server.Stop();
        });

        it("Should listen for requests on the provided port", async () => {
            expect(response?.ok).toBe(true);
        });

        it("Should return the current Dumbo version in a custom response header", async () => {
            expect(response?.ok).toBe(true);
        });

        it("Should return the port the server was started on", () => {
            expect(serverStartResult?.port).toEqual(9091);
        });
    });

    describe("Start server without a specified port", () => {
        let server = CreateServer();
        let response: Response | null = null;
        let serverStartResult: MumboServerStartResult | null = null;

        beforeAll(async () => {
            serverStartResult = await server.Start();
            response = await fetch(`http://localhost:${serverStartResult.port}`);
        });

        afterAll(async () => {
            await server.Stop();
        });

        it("Should listen for requests on the provided port", async () => {
            expect(response?.ok).toBe(true);
        });

        it("Should return the current Dumbo version in a custom response header", async () => {
            expect(response?.ok).toBe(true);
        });

        it("Should return the port the server was started on", () => {
            expect(serverStartResult?.port).to.be.a("number");
            expect(serverStartResult?.port).to.not.equal(0);
        });
    });

    describe("Stopping the server", () => {
        let server = CreateServer();
        let response: Response | null = null;
        let serverStartResult: MumboServerStartResult | null = null;

        beforeAll(async () => {
            serverStartResult = await server.Start();
            await server.Stop();

            response = await fetch(`http://localhost:${serverStartResult.port}`).catch(() => null);
        });

        it("Should have stopped the server from responding to further requests", () => {
            expect(response?.ok).toBeFalsy();
            expect(serverStartResult?.port).to.be.a("number");
            expect(serverStartResult?.port).to.not.equal(0);
        });
    });
});

describe("Making requests", () => {
    let server = CreateServer();

    beforeAll(async () => {
        await server.Start(9091);
    });

    afterAll(async () => {
        await server.Stop();
    });

    describe("Clearing requests", () => {
        let requests: MumboRequestLog[] = [];

        beforeAll(async () => {
            await fetch(`http://localhost:9091/test-request`);
            server.ClearRequests();
            requests = server.GetRequests();
        });

        afterAll(() => {
            server.ClearRequests();
        });

        it("Should return no requests from `GetRequests()`", () => {
            expect(requests.length).to.equal(0);
        });
    });

    describe("Making a GET request", () => {
        let requests: MumboRequestLog[] = [];

        beforeAll(async () => {
            await fetch(`http://localhost:9091/test-request`);
            requests = server.GetRequests();
        });

        afterAll(() => {
            server.ClearRequests();
        });

        it("Should return the request with `GetRequests()`", () => {
            expect(requests.length).to.equal(1);
        });

        it("Request log should contain a URL with the path `/test-request`", () => {
            expect(requests[0].url.pathname).to.equal("/test-request");
        });

        it("Request log should contain the method 'GET'", () => {
            expect(requests[0].method).to.equal("GET");
        });
    });

    describe("Making a request to the base path", () => {
        describe("With a trailing '/'", () => {
            let requests: MumboRequestLog[] = [];

            beforeAll(async () => {
                await fetch(`http://localhost:9091/`);
                requests = server.GetRequests();
            });

            afterAll(() => {
                server.ClearRequests();
            });

            it("Should return the request with `GetRequests()`", () => {
                expect(requests.length).to.equal(1);
            });

            it("Request log should contain a URL with the path `/`", () => {
                expect(requests[0].url.pathname).to.equal("/");
            });

            it("Request log should contain the method 'GET'", () => {
                expect(requests[0].method).to.equal("GET");
            });
        });

        describe("Without a trailing '/'", () => {
            let requests: MumboRequestLog[] = [];

            beforeAll(async () => {
                await fetch(`http://localhost:9091`);
                requests = server.GetRequests();
            });

            afterAll(() => {
                server.ClearRequests();
            });

            it("Should return the request with `GetRequests()`", () => {
                expect(requests.length).to.equal(1);
            });

            it("Request log should contain a URL with the path `/`", () => {
                expect(requests[0].url.pathname).to.equal("/");
            });

            it("Request log should contain the method 'GET'", () => {
                expect(requests[0].method).to.equal("GET");
            });
        });
    });

    describe("Making a POST request", () => {
        let requests: MumboRequestLog[] = [];

        beforeAll(async () => {
            await fetch(`http://localhost:9091/test-request`, {
                method: "POST",
                body: JSON.stringify({
                    test: "object",
                }),
            });

            requests = server.GetRequests();
        });

        afterAll(() => {
            server.ClearRequests();
        });

        it("Should return the request with `GetRequests()`", () => {
            expect(requests.length).to.equal(1);
        });

        it("Request log should contain a URL with the path `/test-request`", () => {
            expect(requests[0].url.pathname).to.equal("/test-request");
        });

        it("Request log should contain the method 'POST'", () => {
            expect(requests[0].method).to.equal("POST");
        });

        it("Request log should contain the request body", () => {
            expect(JSON.parse(requests[0].body)).toEqual({
                test: "object",
            });
        });
    });
});

describe("Configuring responses", () => {
    let server = CreateServer();

    beforeAll(async () => {
        await server.Start(9091);
    });

    describe("Route with no configuration", () => {
        let response: Response;

        beforeAll(async () => {
            response = await fetch(`http://localhost:9091/no-mocked-response-200`);
        });

        it("Should return a 200", () => {
            expect(response.status).to.equal(200);
        });
    });

    describe("Route that returns a 201", () => {
        let response: Response;

        beforeAll(async () => {
            server.ConfigureResponse("GET", "/mocked-response-200", () => {
                return {
                    statusCode: 201,
                };
            });

            response = await fetch(`http://localhost:9091/mocked-response-200`);
        });

        it("Should return a 201", () => {
            expect(response.status).to.equal(201);
        });
    });

    describe("Route that returns a body", () => {
        let response: Response;
        let responseBody: any;

        beforeAll(async () => {
            server.ConfigureResponse("GET", "/mocked-response-body", () => {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        test: "response",
                        number: 123,
                    }),
                };
            });

            response = await fetch(`http://localhost:9091/mocked-response-body`);
            responseBody = await response.json();
        });

        it("Should return a 200", () => {
            expect(response.status).to.equal(200);
        });

        it("Should return the previously mocked body", () => {
            expect(responseBody).toEqual({
                test: "response",
                number: 123,
            });
        });
    });

    describe("Routes with different methods", () => {
        let responseOne: Response;
        let responseTwo: Response;

        beforeAll(async () => {
            server.ConfigureResponse("GET", "/mocked-response-method", () => {
                return {
                    statusCode: 201,
                };
            });

            server.ConfigureResponse("POST", "/mocked-response-method", () => {
                return {
                    statusCode: 202,
                };
            });

            responseOne = await fetch(`http://localhost:9091/mocked-response-method`);
            responseTwo = await fetch(`http://localhost:9091/mocked-response-method`, {
                method: "POST",
            });
        });

        it("GET should return a 201", () => {
            expect(responseOne.status).to.equal(201);
        });

        it("POST should return a 202", () => {
            expect(responseTwo.status).to.equal(202);
        });
    });
});
