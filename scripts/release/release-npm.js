const fs = require("fs-extra")
const path = require("path")
const ora = require("ora")
const { execSync } = require("child_process")
const { getVersion } = require("./version")

const argv = require("minimist")(process.argv.slice(2), {
  alias: { "dry-run": "dryRun" }
})

const PACKAGES_DIR = "build/packages"

async function releasePackage(version, packagePath) {
  const name = packagePath.split("/").reverse()[0]
  const spinner = ora(`Publishing @lingui/${name}@${version}`)

  const tags = argv.next ? "--tags next" : ""
  const cmd = `npm publish --access public ${tags}`

  if (!argv.dryRun) {
    try {
      execSync(cmd, {
        cwd: packagePath
      })
    } catch (e) {
      spinner.fail(`Version ${version} already published!`)
    }
  } else {
    console.log(`DRY RUN: ${cmd}`)
  }

  spinner.succeed()
}

async function main() {
  const version = await getVersion(argv.next)

  fs.readdirSync(PACKAGES_DIR)
    .map(directory => path.join(PACKAGES_DIR, directory))
    .filter(directory => fs.lstatSync(directory).isDirectory())
    .map(packagePath => releasePackage(version, packagePath))
}

main()
