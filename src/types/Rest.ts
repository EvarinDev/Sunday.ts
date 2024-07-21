/* The `interface RestEventEmitter` in the TypeScript code snippet is defining a structure for an event
emitter related to a REST service. It specifies the types of functions that can be included in an
object implementing the `RestEventEmitter` interface. */
interface RestEventEmitter {
    ready: () => void;
    raw: (data: unknown) => void;
    get: (data: unknown) => void;
    error: (error: Error) => void;
    post: (data: unknown) => void;
    patch: (data: unknown) => void;
}

/* The `interface RestConfig` in the TypeScript code snippet defines a structure for configuration
settings related to a REST service. It specifies the properties that can be included in a
`RestConfig` object, which are: */
interface RestConfig {
    host: string;
    port: number;
    password: string;
    secure?: boolean;
}

export type {
    RestEventEmitter,
    RestConfig
}