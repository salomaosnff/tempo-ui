import { defineComponent, h } from "vue"

export type TagName = keyof HTMLElementTagNameMap | ({} & string)

export interface PrimitiveProps {
  /**
   * The HTML tag to use for the root element.
   * Note: If `asChild` is true, this prop will be ignored.
   * @default 'div'
   */
  as?: TagName

  /**
   * Enable renderless mode.
   * If true, the component will render only the children.
   * @default false
   */
  asChild?: boolean
}

const selfClosingTags = new Set<TagName>([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

/**
 * The Primitive component is a low-level component that allows you to render any HTML element.
 * It is the base component for all other components in the library.
 */
export default defineComponent<PrimitiveProps>({
  name: 'Primitive',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'div',
    },
    asChild: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      if (props.asChild) {
        return slots.default?.({ attrs })
      }

      if (props.as && selfClosingTags.has(props.as)) {
        return h(props.as, attrs)
      }

      return h(props.as ?? 'div', attrs, slots.default?.({ attrs }))
    }
  },
})