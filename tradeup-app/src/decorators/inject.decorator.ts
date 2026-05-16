import { Registry, type RegistryMap } from '@lib/registry/registry.lib';

export function Inject(name: keyof RegistryMap) {
  return function (_value: undefined, context: ClassFieldDecoratorContext) {
    context.addInitializer(function () {
      const self = this as any;

      Object.defineProperty(self, context.name, {
        configurable: true,
        enumerable: true,
        get() {
          const dependency = Registry.getInstance().inject(name);

          return new Proxy(
            {},
            {
              get(_target, prop: string | symbol) {
                return dependency[prop as keyof typeof dependency];
              },
            },
          );
        },
      });
    });
  };
}
