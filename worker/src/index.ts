export { HokmRoom } from "./room";

export interface Env {
  ROOMS: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/room\/([a-zA-Z0-9_-]{1,64})$/);

    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    const roomId = match[1];
    const id = env.ROOMS.idFromName(roomId);
    const stub = env.ROOMS.get(id);
    return stub.fetch(request);
  },
};
