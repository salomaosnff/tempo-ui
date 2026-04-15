import { computed, onBeforeUnmount, onMounted, readonly, shallowRef, toValue, useId, watch, type MaybeRefOrGetter } from "vue";

export function useAnchorName(element: MaybeRefOrGetter<HTMLElement | null | undefined>) {
    let oldAnchorName: string;
    const anchorName = shallowRef(`--${useId()}`);

    function updateAnchor() {
        const el = toValue(element)

        if (!el) {
            return
        }

        oldAnchorName ||= el.style.getPropertyValue('anchor-name')
        el.style.setProperty('anchor-name', anchorName.value)
    }

    onMounted(updateAnchor)

    watch(() => toValue(element), updateAnchor, { flush: 'post' })

    onBeforeUnmount(() => {
        const el = toValue(element)

        if (!el) {
            return
        }

        if (oldAnchorName) {
            el.style.setProperty('anchor-name', oldAnchorName)
            oldAnchorName = ''
        } else {
            el.style.removeProperty('anchor-name')
        }
    })

    return computed(() => {
        if (toValue(element)) {
            return anchorName.value
        }

        return null
    })
}