import { render, h as hp, type ComponentType, type Attributes } from "preact";
import { defineComponent, watchEffect, h as hv, ref, Teleport } from "vue";

type CommonPreactComponentProps = {
  setChildrenContainer?: (ele: HTMLElement | null) => void;
};

export function connect<P extends CommonPreactComponentProps>(
  component: ComponentType<P>
) {
  return defineComponent<P>({
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      const containerRef = ref();
      const childrenContainerRef = ref<HTMLElement | null>(null);

      watchEffect(() => {
        if (containerRef.value) {
          render(
            hp(component, {
              ...attrs,
              setChildrenContainer: (e: HTMLElement) =>
                (childrenContainerRef.value = e),
            } as unknown as P & Attributes),
            containerRef.value
          );
        }
      });
      return () =>
        hv("div", { ref: containerRef }, [
          childrenContainerRef.value
            ? hv(Teleport, { to: childrenContainerRef.value }, [
                slots.default?.(),
              ])
            : null,
        ]);
    },
  });
}
