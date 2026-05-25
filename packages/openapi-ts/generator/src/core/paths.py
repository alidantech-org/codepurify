from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from core.errors import PathResolutionError


@dataclass(frozen=True)
class ProjectPaths:
    root: Path

    @property
    def src(self) -> Path:
        return self.root / "src"

    @property
    def tests(self) -> Path:
        return self.root / "tests"

    @property
    def templates(self) -> Path:
        return self.src / "templates"

    @property
    def language_templates(self) -> Path:
        return self.src / "languages"

    @property
    def pyproject(self) -> Path:
        return self.root / "pyproject.toml"

    @classmethod
    def from_cwd(cls, cwd: Path | None = None) -> "ProjectPaths":
        current = (cwd or Path.cwd()).resolve()

        # If command is run inside generator/, detect it directly.
        if (current / "pyproject.toml").exists() and (current / "src").exists():
            return cls(root=current)

        # If command is run from parent repo, detect generator/.
        generator_root = current / "generator"
        if (generator_root / "pyproject.toml").exists() and (generator_root / "src").exists():
            return cls(root=generator_root.resolve())

        raise PathResolutionError("Could not find generator project root. Run from generator/ or from the repo root.")

    def resolve_input(self, value: str | Path) -> Path:
        path = Path(value)

        if path.is_absolute():
            return path.resolve()

        cwd_path = (Path.cwd() / path).resolve()
        if cwd_path.exists():
            return cwd_path

        root_path = (self.root / path).resolve()
        if root_path.exists():
            return root_path

        return cwd_path

    def resolve_output(self, value: str | Path) -> Path:
        path = Path(value)

        if path.is_absolute():
            return path.resolve()

        return (Path.cwd() / path).resolve()
