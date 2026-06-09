import { Action, ActionPanel, Color, Icon, List } from "@raycast/api"
import { components } from "@/types/generated"
import SubjectDetail from "./SubjectDetail"

type RelatedSubject = components["schemas"]["v0_RelatedSubject"]

interface RelatedWorksListProps {
  subjects: RelatedSubject[]
}

const getRelationColor = (relation: string): Color => {
  switch (relation) {
    case "主角":
      return Color.Red
    case "配角":
      return Color.Blue
    case "客串":
      return Color.Orange
    default:
      return Color.SecondaryText
  }
}

export default function RelatedWorksList({ subjects }: RelatedWorksListProps) {
  return (
    <List navigationTitle="Related Works" searchBarPlaceholder="Filter related works...">
      {subjects.map((subject) => (
        <List.Item
          key={subject.id}
          icon={subject.image || Icon.Image}
          title={subject.name_cn || subject.name}
          subtitle={subject.name !== subject.name_cn ? subject.name : undefined}
          accessories={subject.staff ? [{ tag: { value: subject.staff, color: getRelationColor(subject.staff) } }] : []}
          actions={
            <ActionPanel>
              <Action.Push title="Show Details" icon={Icon.Sidebar} target={<SubjectDetail subjectId={subject.id} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
