import {
  List,
  Clipboard,
  ActionPanel,
  Action,
  Color,
  Icon,
  showToast,
  Toast,
  closeMainWindow,
  PopToRootType,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { createConceptNotionPage } from "./notion/addConceptToPage";

export default function Command() {
  const [titleText, setTitleText] = useState<string>("");
  const [clipboardText, setClipboardText] = useState<string | null>(null);

  useEffect(() => {
    async function readClipboard() {
      const { text } = await Clipboard.read();
      setClipboardText(text);
    }

    readClipboard();
  }, []);

  async function onAction() {
    if (clipboardText && titleText !== "") {
      await closeMainWindow({ clearRootSearch: false, popToRootType: PopToRootType.Suspended });

      await showToast({
        style: Toast.Style.Animated,
        title: `Adding concept ${titleText} to Notion`,
      });
      await createConceptNotionPage(titleText, clipboardText);
      await showToast({
        style: Toast.Style.Success,
        title: `Concept Added!`,
      });
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: `Missing concept name to content!`,
      });
    }
  }
  const getMessage = () => {
    if (!clipboardText && !titleText) {
      return "Clipboard and concept name are both empty.";
    }
    if (!clipboardText) {
      return "Clipboard is empty.";
    }
    if (!titleText) {
      return "No concept name yet...";
    }
    return "Ready";
  };

  return (
    <List isShowingDetail searchBarPlaceholder="Concept name" onSearchTextChange={setTitleText}>
      <List.Item
        icon="list_icon.png"
        title={""}
        actions={
          <ActionPanel>
            <Action title="Add Concept" onAction={onAction} />
          </ActionPanel>
        }
        detail={<List.Item.Detail markdown={clipboardText} />}
        accessories={[
          {
            tag: {
              value: getMessage(),
              color: clipboardText && titleText ? Color.Green : Color.Red,
            },
            icon: clipboardText && titleText ? Icon.Checkmark : Icon.XMarkCircle,
          },
        ]}
      />
    </List>
  );
}