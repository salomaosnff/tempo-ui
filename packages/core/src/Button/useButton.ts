import { createContext } from "@/_shared/createContext";
import type { ShallowRef } from "vue";

export interface ButtonProvider {
  isDisabled: ShallowRef<boolean>;
  isLoading: ShallowRef<boolean>;
  triggerClick(event: MouseEvent): Promise<void>;
}

const { inject, provide } = createContext<ButtonProvider>("Button");

export { inject as useButton, provide as provideButton };
