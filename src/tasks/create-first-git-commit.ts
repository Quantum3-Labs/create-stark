import { execa } from "execa";
import path from "path";

// Checkout the latest release tag in a git submodule
async function checkoutLatestTag(submodulePath: string): Promise<void> {
  try {
    const { stdout } = await execa("git", ["tag", "-l", "--sort=-v:refname"], {
      cwd: submodulePath,
    });
    const tagLines = stdout.split("\n");
    if (tagLines.length > 0) {
      const latestTag = tagLines[0];
      await execa("git", ["-C", `${submodulePath}`, "checkout", latestTag]);
    } else {
      throw new Error(`No tags found in submodule at ${submodulePath}`);
    }
  } catch (error) {
    console.error("Error checking out latest tag:", error);
    throw error;
  }
}

export async function createFirstGitCommit(
  targetDir: string
) {
  try {
    await execa("git", ["submodule", "add", "-f", "https://github.com/0xSpaceShard/starknet-devnet-rs", "packages/snfoundry/local-devnet"], {
      cwd: targetDir,
    });

    const localDevnetPath = path.resolve(targetDir, "packages", "snfoundry", "local-devnet");
    await execa("git", ["checkout", "46e0ec032956f0e7cbe0330f32b6b31eff824087"], { cwd: localDevnetPath });

    await execa("git", ["add", "-A"], { cwd: targetDir });
    await execa(
      "git",
      ["commit", "-m", "Initial commit with 🏗️ Scaffold-Stark 2", "--no-verify"],
      { cwd: targetDir }
    );
  } catch (e: any) {
    throw new Error("Failed to initialize git repository", {
      cause: e?.stderr ?? e,
    });
  }
}
