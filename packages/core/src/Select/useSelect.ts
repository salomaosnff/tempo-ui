import { createContext } from "../_shared/createContext";
import type { Pager } from "../composables/pager/pager";
import type { Ref } from "vue";

export interface SelectContext<TValue = any> {
  isOpen: Ref<boolean>;
  modelValue: Ref<TValue | TValue[] | undefined>;
  multiple: Ref<boolean>;
  items?: Ref<Pager<any> | any[] | undefined>;

  open(): void;
  close(): void;
  toggle(): void;

  select(value: TValue): void;
  isSelected(value: TValue): boolean;
}

export const { provide: provideSelect, inject: useSelect } = createContext<SelectContext>("Select");
