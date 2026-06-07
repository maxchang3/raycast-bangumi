export default (api) => ["npm run fix-lint", `prettier --write --ignore-unknown ${api.filenames.join(" ")}`]
