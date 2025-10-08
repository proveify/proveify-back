type Ctor<T> = abstract new (...args: unknown[]) => T;

export class GroupDispatcher<I = unknown, C = unknown> {
    private ctor = new Map<Ctor<unknown>, (item: I, ctx: C) => string[]>();
    private ordered: [Ctor<unknown>, (item: I, ctx: C) => string[]][] = [];

    public register<T extends I>(ctor: Ctor<T>, handler: (item: T, ctx: C) => string[]): void {
        const typed = handler as (item: I, ctx: C) => string[];
        this.ctor.set(ctor, typed);
        this.ordered.push([ctor, typed]);
    }

    public determine(item: I, ctx: C): string[] {
        if (item == null || typeof item !== "object") return [];

        const maybeCtor = (item as object).constructor as Ctor<unknown> | undefined;
        if (maybeCtor) {
            const direct = this.ctor.get(maybeCtor);
            if (direct) return direct(item, ctx);
        }

        for (const [Ctor, handler] of this.ordered) {
            if (item instanceof (Ctor as new (...args: unknown[]) => object)) {
                return handler(item, ctx);
            }
        }

        return [];
    }
}
