import type { ReactElement } from "react";
import type { OsTab } from "./components/shell/nav";

// Types for the Behaviour OS component (App.jsx).
export default function App(props?: {
  tab?: OsTab;
  onTabChange?: (tab: OsTab) => void;
}): ReactElement;
