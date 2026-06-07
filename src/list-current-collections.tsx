import { SubjectCollectionType } from "@/bangumi"
import CollectionList from "@/components/CollectionList"

export default function Command() {
  return <CollectionList filterType={SubjectCollectionType.Doing} />
}
