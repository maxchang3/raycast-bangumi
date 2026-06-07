import { withAccessToken } from "@raycast/utils"
import { bangumiAuth } from "@/oauth"
import CollectionList from "@/components/CollectionList"

const Command = () => <CollectionList />

export default withAccessToken(bangumiAuth)(Command)
