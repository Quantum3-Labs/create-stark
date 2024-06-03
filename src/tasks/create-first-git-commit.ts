import { execa } from "execa";
import { Options } from "../types";
import path from "path";
import fs from "fs";

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
    const foundryWorkSpacePath = path.resolve(targetDir, "packages", "snfoundry");
    await execa("git", ["submodule", "update", "--init", "--recursive"], {
      cwd: foundryWorkSpacePath,
    });

    fs.appendFileSync(path.join(path.resolve(targetDir), ".gitignore"), "\nlocal-devnet\n");

    const gitIgnorePath = path.join(path.resolve(targetDir, "packages", "snfoundry"), ".gitignore");
    fs.appendFileSync(gitIgnorePath, "\nlocal-devnet\n");

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
