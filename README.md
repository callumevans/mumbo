<h1 align="center">Mumbo</h1>

# Introduction

Mumbo is a simple http server implementation designed
to be used in testing as an alternative to mocking.

If your project is dependent on HTTP services, Mumbo allows you
to define various routes and their responses, meaning you don't
have to mock them. A real HTTP request and response is being sent.

There are some additional methods provided to help with assertions.

## Usage

Import and call `CreateServer` to create a Mumbo server instance.

### Starting a Mumbo server

You can start a Mumbo server on a specific port.

```typescript
import { CreateServer } from "mumbo";

const mumboServer = CreateServer();

// Tell the mumboServer to start listening to requests on port 1234
await mumboServer.Start(1234)
```

Or let Mumbo use any free port.

```typescript
import { CreateServer } from "mumbo";

const mumboServer = CreateServer();

// Tell the mumboServer to start listening to requests on a free port
const mumboStartResult = await mumboServer.Start()

// Use the mumboStartResult to access the port the server is listening on
const port = mumboStartResult.port;
```

### Configuring a response
You can configure responses that Mumbo should return for specific requests. By default, any requests made will return a 200 and an empty body.
```typescript
// Any GET requests made to the server to the /faked-response-body will
// return a status code of 201, and a JSON body of { example: "response" }
mumboServer.ConfigureResponse("GET", "/faked-response-body", () => {
    return {
        statusCode: 201,
        body: JSON.stringify({
            example: "response",
        }),
    };
});
```

### Getting requests
Mumbo keeps a log of all requests that have been made to it.

```typescript
// Returns a list of all requests made to the Mumbo server
const requests: MumboRequestLog[] = mumboServer.GetRequests();
```

```typescript
type MumboRequestLog = {
    url: URL;
    method: string;
    body: string;
};
```

You can also clear the list of requests.

```typescript
mumboServer.ClearRequests();
```

### Stopping Mumbo
Mumbo can be stopped easily.

```typescript
// Stops Mumbo from listening for requests
await server.Stop();
```
