{
  description = "Krome development shell: Node + pnpm, Rust, and Foundry";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem
    (system: let
      pkgs = import nixpkgs {
        inherit system;
      };
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs_22
          pkgs.pnpm
          pkgs.rustup
          # forge, cast, anvil, chisel for contracts/ (see foundry.toml)
          pkgs.foundry
        ];

        shellHook = ''
          export PS1="[dev] $PS1"
          export PATH=$PWD/node_modules/.bin:$PATH

          [[ -f .env ]] && source .env

          [[ ! -d $PWD/node_modules ]] && pnpm install
        '';
      };
    });
}
