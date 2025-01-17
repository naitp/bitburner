import { INetscriptHelper } from "./INetscriptHelper";
import { WorkerScript } from "../Netscript/WorkerScript";
import { IPlayer } from "../PersonObjects/IPlayer";
import { getRamCost } from "../Netscript/RamCostGenerator";
import { UserInterface as IUserInterface, UserInterfaceTheme } from "../ScriptEditor/NetscriptDefinitions";
import { Settings } from "../Settings/Settings";
import { ThemeEvents } from "../ui/React/Theme";
import { defaultTheme } from "../Settings/Themes";

export function NetscriptUserInterface(
  player: IPlayer,
  workerScript: WorkerScript,
  helper: INetscriptHelper,
): IUserInterface {
  return {
    getTheme: function (): UserInterfaceTheme {
      helper.updateDynamicRam("getTheme", getRamCost(player, "ui", "getTheme"));
      return { ...Settings.theme };
    },

    setTheme: function (newTheme: UserInterfaceTheme): void {
      helper.updateDynamicRam("setTheme", getRamCost(player, "ui", "setTheme"));
      const hex = /^(#)((?:[A-Fa-f0-9]{3}){1,2})$/;
      const currentTheme = {...Settings.theme}
      const errors: string[] = [];
      for (const key of Object.keys(newTheme)) {
        if (!currentTheme[key]) {
          // Invalid key
          errors.push(`Invalid key "${key}"`);
        } else if (!hex.test(newTheme[key] ?? '')) {
          errors.push(`Invalid color "${key}": ${newTheme[key]}`);
        } else {
          currentTheme[key] = newTheme[key];
        }
      }

      if (errors.length === 0) {
        Object.assign(Settings.theme, currentTheme);
        ThemeEvents.emit();
        workerScript.log("ui.setTheme", () => `Successfully set theme`);
      } else {
        workerScript.log("ui.setTheme", () => `Failed to set theme. Errors: ${errors.join(', ')}`);
      }
    },

    resetTheme: function (): void {
      helper.updateDynamicRam("resetTheme", getRamCost(player, "ui", "resetTheme"));
      Settings.theme = defaultTheme;
      ThemeEvents.emit();
      workerScript.log("ui.resetTheme", () => `Reinitialized theme to default`);
    },
  }
}
