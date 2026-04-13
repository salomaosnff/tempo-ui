import { reactive, toRefs } from "vue";
import type { PrimitiveProps } from "./Primitive";

export function usePrimitiveProps<T extends PrimitiveProps>(props: T) {
    const { as, asChild, ...rest } = toRefs(props)

    return {
        primitiveProps: reactive({
            as,
            asChild
        }) as Pick<T, keyof PrimitiveProps>,
        props: reactive(rest) as Omit<T, keyof PrimitiveProps>
    }
}

export function primitiveProps(props: PrimitiveProps) {
    return {
        as: props.as,
        asChild: props.asChild
    }
}