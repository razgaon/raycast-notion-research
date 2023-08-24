import { ActionPanel, Detail, List, Action, useNavigation, openCommandPreferences } from "@raycast/api";
import { ParsedPage } from "../notion/types";
import { createResearchDatabase } from "../notion/createResearchDatabase";

export function PageListItem({ page }: { page: ParsedPage }) {
  const { push } = useNavigation();

  async function onPush() {
    const id = page.id;
    const createdDatabase = await createResearchDatabase(id);
    push(
      <Detail
        actions={
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy and Open Preferences"
              content={createdDatabase.id}
              onCopy={openCommandPreferences}
            />
          </ActionPanel>
        }
        markdown={`Database ID is: ${createdDatabase.id}.\nPress enter to copy it and open the command preferences.`}
      />
    );
  }

  return (
    <List.Item
      icon={page.icon}
      title={page?.title}
      actions={
        <ActionPanel>
          <Action title="Create Database" onAction={onPush} />
        </ActionPanel>
      }
    />
  );
}
