import { withAccessToken } from "@raycast/utils"
import { bangumiAuth } from "@/oauth"
import CollectionList from "@/components/CollectionList"
import { SubjectCollectionType } from "@/bangumi"

const Command = () => <CollectionList filterType={SubjectCollectionType.Doing} />

export default withAccessToken(bangumiAuth)(Command)
