import { Color, Icon } from "@raycast/api"
import { SubjectCollectionType, SubjectType, SubjectVerb } from "@/api/bangumi"

export interface CollectionTag {
  value: string
  color: Color | string
}

export const SubjectCollectionColor: Record<SubjectCollectionType, Color | string> = {
  [SubjectCollectionType.Wish]: Color.Blue,
  [SubjectCollectionType.Collect]: Color.SecondaryText,
  [SubjectCollectionType.Doing]: Color.Green,
  [SubjectCollectionType.OnHold]: "#8E9DAE",
  [SubjectCollectionType.Dropped]: "#B87A7A",
}

export const SubjectCollectionIcon: Record<SubjectCollectionType, Icon> = {
  [SubjectCollectionType.Wish]: Icon.Heart,
  [SubjectCollectionType.Collect]: Icon.Check,
  [SubjectCollectionType.Doing]: Icon.Play,
  [SubjectCollectionType.OnHold]: Icon.Pause,
  [SubjectCollectionType.Dropped]: Icon.Xmark,
}

export const getCollectionTag = (
  collectionType: SubjectCollectionType,
  subjectType: SubjectType = SubjectType.Anime
): CollectionTag => {
  const verbs = SubjectVerb[subjectType]
  const color = SubjectCollectionColor[collectionType]

  switch (collectionType) {
    case SubjectCollectionType.Wish:
      return { value: verbs.wish, color }
    case SubjectCollectionType.Collect:
      return { value: verbs.collect, color }
    case SubjectCollectionType.Doing:
      return { value: verbs.doing, color }
    case SubjectCollectionType.OnHold:
      return { value: "On Hold", color }
    case SubjectCollectionType.Dropped:
      return { value: "Dropped", color }
    default:
      return { value: "Unknown", color }
  }
}
